from rest_framework import serializers
from .models import Beneficiary


class BeneficiarySerializer(serializers.ModelSerializer):
    income_category_display = serializers.CharField(
        source='get_income_category_display', read_only=True
    )
    district_display = serializers.CharField(
        source='get_district_display', read_only=True
    )

    class Meta:
        model = Beneficiary
        fields = '__all__'
        read_only_fields = ['priority_score', 'created_at', 'updated_at']
