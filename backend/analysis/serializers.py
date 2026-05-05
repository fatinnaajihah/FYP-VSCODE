from rest_framework import serializers
from .models import GAGenerationMetric


class GAGenerationMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = GAGenerationMetric
        fields = '__all__'
