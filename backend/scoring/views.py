from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PriorityCriteria
from .serializers import PriorityCriteriaSerializer
from beneficiaries.models import Beneficiary


def calculate_priority_score(beneficiary, criteria):
    """
    Compute a 0–100 vulnerability score for one household.
    Higher score = more vulnerable = higher priority for aid.
    """
    score = 0.0

    # Income component (0–40 points)
    if beneficiary.income_category == 'extreme_poor':
        income_score = 1.0
    elif beneficiary.income_category == 'poor':
        income_score = 0.6
    else:
        income_score = 0.2
    score += income_score * criteria.income_weight

    # Household size component (0–25 points) — normalised to max 10 members
    size_score = min(beneficiary.household_size / 10.0, 1.0)
    score += size_score * criteria.household_size_weight

    # OKU component (0–20 points)
    score += (1.0 if beneficiary.has_oku else 0.0) * criteria.oku_weight

    # Elderly component (0–10 points)
    score += (1.0 if beneficiary.has_elderly else 0.0) * criteria.elderly_weight

    # Infant component (0–5 points)
    score += (1.0 if beneficiary.has_infant else 0.0) * criteria.infant_weight

    return round(score, 2)


class PriorityCriteriaViewSet(viewsets.ModelViewSet):
    queryset = PriorityCriteria.objects.all()
    serializer_class = PriorityCriteriaSerializer

    @action(detail=False, methods=['post'])
    def recalculate(self, request):
        """Recalculate priority scores for all beneficiaries using current criteria."""
        criteria_qs = PriorityCriteria.objects.all()
        if not criteria_qs.exists():
            return Response(
                {'error': 'No priority criteria configured.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        criteria = criteria_qs.first()
        beneficiaries = Beneficiary.objects.all()
        updated = 0
        for b in beneficiaries:
            b.priority_score = calculate_priority_score(b, criteria)
            b.save(update_fields=['priority_score', 'updated_at'])
            updated += 1

        return Response({
            'message': f'Recalculated scores for {updated} households.',
            'criteria_used': PriorityCriteriaSerializer(criteria).data,
        })

    @action(detail=False, methods=['get'])
    def ranked_households(self, request):
        """Return all beneficiaries sorted by priority score (highest first)."""
        from beneficiaries.serializers import BeneficiarySerializer
        qs = Beneficiary.objects.all().order_by('-priority_score')
        return Response(BeneficiarySerializer(qs, many=True).data)
