from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import GAGenerationMetric
from .serializers import GAGenerationMetricSerializer
from optimization.models import AllocationRun


class GAGenerationMetricViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = GAGenerationMetric.objects.all()
    serializer_class = GAGenerationMetricSerializer

    def get_queryset(self):
        qs = GAGenerationMetric.objects.all()
        run_id = self.request.query_params.get('run_id')
        if run_id:
            qs = qs.filter(run_id=run_id)
        return qs

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Return a high-level summary of all completed runs."""
        runs = AllocationRun.objects.filter(status='completed').order_by('-created_at')
        data = []
        for run in runs:
            data.append({
                'run_id': run.id,
                'run_mode': run.run_mode,
                'num_generations': run.num_generations,
                'population_size': run.population_size,
                'total_food_packages': run.total_food_packages,
                'best_fitness': run.best_fitness,
                'gini_coefficient': run.gini_coefficient,
                'coverage_rate': run.coverage_rate,
                'priority_satisfaction_rate': run.priority_satisfaction_rate,
                'created_at': run.created_at,
                'completed_at': run.completed_at,
            })
        return Response(data)
