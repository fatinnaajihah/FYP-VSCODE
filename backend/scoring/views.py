from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import PriorityCriteria
from .serializers import PriorityCriteriaSerializer
from beneficiaries.models import Beneficiary


def calculate_priority_score(beneficiary, criteria):
    """
    Compute a 0–100 vulnerability score for one household.
    Higher score = more vulnerable = higher priority for food aid.

    Framework references:
    ─ Malaysia Multidimensional Poverty Index (DOSM, 2020) — MPI dimensions:
        Education, Health, Living Standards
    ─ WFP Vulnerability Assessment and Mapping (VAM) — Food Security indicators:
        Food Consumption Score, Coping Strategy Index, Dependency Ratio
    ─ JKM (Jabatan Kebajikan Masyarakat) — Bantuan Am eligibility criteria

    Scoring sub-components (all normalised to 0.0–1.0 before applying weight):
    ┌─────────────────────────────┬────────┬──────────────────────────────────────┐
    │ Indicator                   │ Weight │ Reference                            │
    ├─────────────────────────────┼────────┼──────────────────────────────────────┤
    │ Income category             │ 33     │ MPI Living Standards + EPU PLI tiers │
    │ Employment status           │ 12     │ WFP CSI + MPI Living Standards       │
    │ Household size              │ 13     │ WFP Dependency Ratio (household unit) │
    │ Children under 18           │  8     │ WFP Dependency Ratio + MPI Education  │
    │ OKU member                  │ 14     │ MPI Health dimension (disability)     │
    │ Elderly dependent           │  8     │ MPI Health + JKM eligibility          │
    │ Infant (< 5 yrs)            │  7     │ WFP nutritional vulnerability         │
    │ Single-parent household     │  5     │ JKM Bantuan Am criterion              │
    └─────────────────────────────┴────────┴──────────────────────────────────────┘
    Total weights = 100
    """
    score = 0.0

    # ── 1. Income category (MPI Living Standards + EPU Poverty Line Income) ──
    # Thresholds aligned with Malaysia's PLI and B40 classification (DOSM 2020)
    income_map = {'extreme_poor': 1.0, 'poor': 0.6, 'vulnerable': 0.2}
    score += income_map.get(beneficiary.income_category, 0.2) * criteria.income_weight

    # ── 2. Employment status (WFP Coping Strategy Index) ─────────────────────
    # Unemployed households have no income buffer and resort to crisis-level
    # coping strategies (skipping meals, reducing portions) — WFP CSI score ≥ 18
    employment_map = {'unemployed': 1.0, 'informal_sector': 0.55, 'employed': 0.1}
    score += employment_map.get(beneficiary.employment_status, 0.1) * criteria.employment_weight

    # ── 3. Household size (WFP — larger household = higher food demand) ───────
    # Normalised to a ceiling of 10 members (consistent with JKM household cap)
    size_score = min(beneficiary.household_size / 10.0, 1.0)
    score += size_score * criteria.household_size_weight

    # ── 4. Children under 18 (WFP Dependency Ratio + MPI Education) ──────────
    # Each additional child raises the dependency ratio and food consumption need
    # Normalised to 6 children (≥ 6 children = maximum score)
    children_score = min(beneficiary.num_children / 6.0, 1.0)
    score += children_score * criteria.children_weight

    # ── 5. OKU member (MPI Health dimension — disability indicator) ───────────
    # Presence of a registered OKU (Orang Kurang Upaya) member reduces
    # household earning capacity and increases care costs
    score += (1.0 if beneficiary.has_oku else 0.0) * criteria.oku_weight

    # ── 6. Elderly dependent (MPI Health + JKM) ──────────────────────────────
    score += (1.0 if beneficiary.has_elderly else 0.0) * criteria.elderly_weight

    # ── 7. Infant under 5 years (WFP nutritional vulnerability) ──────────────
    # Infants are the most nutritionally vulnerable sub-group per WFP VAM
    score += (1.0 if beneficiary.has_infant else 0.0) * criteria.infant_weight

    # ── 8. Single-parent household (JKM Bantuan Am eligibility) ──────────────
    # Single income + primary childcare responsibility = compounded vulnerability
    score += (1.0 if beneficiary.is_single_parent else 0.0) * criteria.single_parent_weight

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
