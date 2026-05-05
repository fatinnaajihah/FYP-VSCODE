from django.db import models


class AllocationRun(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('running', 'Running'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    num_generations = models.PositiveIntegerField(default=100)
    population_size = models.PositiveIntegerField(default=50)
    crossover_rate = models.FloatField(default=0.8)
    mutation_rate = models.FloatField(default=0.1)
    elitism_count = models.PositiveIntegerField(default=2)
    total_food_packages = models.PositiveIntegerField(default=100)
    max_per_household = models.PositiveIntegerField(default=5)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    best_fitness = models.FloatField(null=True, blank=True)
    gini_coefficient = models.FloatField(null=True, blank=True)
    coverage_rate = models.FloatField(null=True, blank=True)
    priority_satisfaction_rate = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Run #{self.pk} | {self.num_generations} gen | {self.status}"


class AllocationResult(models.Model):
    run = models.ForeignKey(AllocationRun, on_delete=models.CASCADE, related_name='results')
    beneficiary = models.ForeignKey('beneficiaries.Beneficiary', on_delete=models.CASCADE)
    allocated_quantity = models.PositiveIntegerField(default=0)
    is_served = models.BooleanField(default=False)

    class Meta:
        ordering = ['-beneficiary__priority_score']

    def __str__(self):
        return f"Run #{self.run_id} | {self.beneficiary.name} | qty={self.allocated_quantity}"
