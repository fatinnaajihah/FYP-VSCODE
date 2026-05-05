from rest_framework import serializers
from .models import AllocationRun, AllocationResult
from beneficiaries.serializers import BeneficiarySerializer


class AllocationResultSerializer(serializers.ModelSerializer):
    beneficiary_detail = BeneficiarySerializer(source='beneficiary', read_only=True)

    class Meta:
        model = AllocationResult
        fields = ['id', 'beneficiary', 'beneficiary_detail',
                  'allocated_quantity', 'is_served']


class AllocationRunSerializer(serializers.ModelSerializer):
    results = AllocationResultSerializer(many=True, read_only=True)

    class Meta:
        model = AllocationRun
        fields = '__all__'
        read_only_fields = [
            'status', 'best_fitness', 'gini_coefficient',
            'coverage_rate', 'priority_satisfaction_rate',
            'created_at', 'completed_at',
        ]


class AllocationRunListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views (excludes nested results)."""
    class Meta:
        model = AllocationRun
        exclude = []
