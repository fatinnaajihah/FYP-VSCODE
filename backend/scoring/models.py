from django.db import models


class PriorityCriteria(models.Model):
    """
    Configurable weights for computing household vulnerability scores.
    Weights should sum to 100.
    """
    # ── Original indicators ─────────────────────────────────────────────────
    income_weight         = models.FloatField(default=33.0)
    household_size_weight = models.FloatField(default=13.0)
    oku_weight            = models.FloatField(default=14.0)
    elderly_weight        = models.FloatField(default=8.0)
    infant_weight         = models.FloatField(default=7.0)

    # ── New indicators (Malaysia MPI + WFP VAM + JKM) ──────────────────────
    # Ref: WFP Coping Strategy Index + MPI Living Standards
    employment_weight     = models.FloatField(default=12.0)
    # Ref: WFP Dependency Ratio + MPI Education dimension
    children_weight       = models.FloatField(default=8.0)
    # Ref: JKM Malaysia eligibility criterion
    single_parent_weight  = models.FloatField(default=5.0)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name_plural = 'Priority Criteria'

    def __str__(self):
        return (
            f"Criteria — income={self.income_weight}, "
            f"employment={self.employment_weight}, "
            f"oku={self.oku_weight}"
        )
