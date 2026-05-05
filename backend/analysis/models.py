from django.db import models


class GAGenerationMetric(models.Model):
    """Stores per-generation metrics for a GA run — used for convergence charts."""
    run = models.ForeignKey(
        'optimization.AllocationRun',
        on_delete=models.CASCADE,
        related_name='metrics'
    )
    generation = models.PositiveIntegerField()
    best_fitness = models.FloatField()
    avg_fitness = models.FloatField()
    gini_coefficient = models.FloatField()
    coverage_rate = models.FloatField()
    priority_satisfaction_rate = models.FloatField()

    class Meta:
        ordering = ['run', 'generation']

    def __str__(self):
        return f"Run #{self.run_id} | Gen {self.generation}"
