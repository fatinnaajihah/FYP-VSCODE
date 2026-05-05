from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Beneficiary
from .serializers import BeneficiarySerializer


class BeneficiaryViewSet(viewsets.ModelViewSet):
    queryset = Beneficiary.objects.all()
    serializer_class = BeneficiarySerializer

    def get_queryset(self):
        qs = Beneficiary.objects.all()
        district = self.request.query_params.get('district')
        income_category = self.request.query_params.get('income_category')
        if district:
            qs = qs.filter(district=district)
        if income_category:
            qs = qs.filter(income_category=income_category)
        return qs

    @action(detail=False, methods=['get'])
    def stats(self, request):
        qs = Beneficiary.objects.all()
        return Response({
            'total': qs.count(),
            'extreme_poor': qs.filter(income_category='extreme_poor').count(),
            'poor': qs.filter(income_category='poor').count(),
            'vulnerable': qs.filter(income_category='vulnerable').count(),
            'with_oku': qs.filter(has_oku=True).count(),
            'with_elderly': qs.filter(has_elderly=True).count(),
            'with_infant': qs.filter(has_infant=True).count(),
            'by_district': {
                d: qs.filter(district=d).count()
                for d in qs.values_list('district', flat=True).distinct()
            },
        })
