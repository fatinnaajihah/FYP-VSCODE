from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import AllocationRun, AllocationResult
from .serializers import AllocationRunSerializer, AllocationRunListSerializer
from .ga_engine import run_ga
from .sa_engine import run_sa
from analysis.models import GAGenerationMetric
from beneficiaries.models import Beneficiary


class AllocationRunViewSet(viewsets.ModelViewSet):
    queryset = AllocationRun.objects.all()

    def get_serializer_class(self):
        if self.action == 'list':
            return AllocationRunListSerializer
        return AllocationRunSerializer

    @action(detail=False, methods=['post'])
    def execute(self, request):
        """
        Trigger a GA run.
        Accepts the same fields as AllocationRun model.
        Runs synchronously and returns results immediately.
        """
        serializer = AllocationRunSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        beneficiaries = Beneficiary.objects.all().values('id', 'priority_score')
        if not beneficiaries:
            return Response(
                {'error': 'No beneficiaries in the database. Please add households first.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        run = serializer.save(status='running')

        try:
            households = list(beneficiaries)
            if run.run_mode == 'sa':
                result = run_sa(
                    households=households,
                    total_packages=run.total_food_packages,
                    num_iterations=run.num_generations,
                    max_per_household=run.max_per_household,
                )
            else:
                result = run_ga(
                    households=households,
                    total_packages=run.total_food_packages,
                    num_generations=run.num_generations,
                    population_size=run.population_size,
                    crossover_rate=run.crossover_rate,
                    mutation_rate=0.0 if run.run_mode == 'crossover_only' else run.mutation_rate,
                    elitism_count=run.elitism_count,
                    max_per_household=run.max_per_household,
                )

            # Persist per-household allocation results
            AllocationResult.objects.filter(run=run).delete()
            beneficiary_map = {b.id: b for b in Beneficiary.objects.all()}
            allocation_objects = []
            for detail in result['allocation_details']:
                b = beneficiary_map.get(detail['id'])
                if b:
                    allocation_objects.append(AllocationResult(
                        run=run,
                        beneficiary=b,
                        allocated_quantity=detail['allocated_quantity'],
                        is_served=detail['is_served'],
                    ))
            AllocationResult.objects.bulk_create(allocation_objects)

            # Persist per-generation metrics
            GAGenerationMetric.objects.filter(run=run).delete()
            metric_objects = [
                GAGenerationMetric(
                    run=run,
                    generation=m['generation'],
                    best_fitness=m['best_fitness'],
                    avg_fitness=m['avg_fitness'],
                    gini_coefficient=m['gini_coefficient'],
                    coverage_rate=m['coverage_rate'],
                    priority_satisfaction_rate=m['priority_satisfaction_rate'],
                )
                for m in result['generation_metrics']
            ]
            GAGenerationMetric.objects.bulk_create(metric_objects)

            # Update run summary
            fm = result['final_metrics']
            run.status = 'completed'
            run.best_fitness = fm['fitness']
            run.gini_coefficient = fm['gini']
            run.coverage_rate = fm['coverage']
            run.priority_satisfaction_rate = fm['priority_satisfaction']
            run.completed_at = timezone.now()
            run.save()

            return Response(AllocationRunSerializer(run).data, status=status.HTTP_201_CREATED)

        except Exception as exc:
            run.status = 'failed'
            run.save(update_fields=['status'])
            return Response({'error': str(exc)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

