from django.db import models


class PriorityCriteria(models.Model):
    """
    Configurable weights for computing household vulnerability scores.
    Weights should sum to 100.
    """
    income_weight = models.FloatField(default=40.0)
    household_size_weight = models.FloatField(default=25.0)
    oku_weight = models.FloatField(default=20.0)
    elderly_weight = models.FloatField(default=10.0)
    infant_weight = models.FloatField(default=5.0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Priority Criteria'

    def __str__(self):
        return f"Criteria (income={self.income_weight}, size={self.household_size_weight}, oku={self.oku_weight})"
