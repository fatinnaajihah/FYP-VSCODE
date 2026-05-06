from rest_framework import serializers
from .models import PriorityCriteria


class PriorityCriteriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = PriorityCriteria
        fields = '__all__'

    def validate(self, data):
        total = (
            data.get('income_weight', 0)
            + data.get('household_size_weight', 0)
            + data.get('oku_weight', 0)
            + data.get('elderly_weight', 0)
            + data.get('infant_weight', 0)
            + data.get('employment_weight', 0)
            + data.get('children_weight', 0)
            + data.get('single_parent_weight', 0)
        )
        if abs(total - 100.0) > 0.01:
            raise serializers.ValidationError(
                f"Weights must sum to 100. Current sum: {total}"
            )
        return data
