from django.db import models


class Beneficiary(models.Model):
    INCOME_CHOICES = [
        ('extreme_poor', 'Extreme Poor (< RM1,000)'),
        ('poor', 'Poor (RM1,000 - RM2,000)'),
        ('vulnerable', 'Vulnerable (RM2,001 - RM4,850)'),
    ]

    DISTRICT_CHOICES = [
        ('george_town', 'George Town'),
        ('bayan_lepas', 'Bayan Lepas'),
        ('butterworth', 'Butterworth'),
        ('seberang_perai', 'Seberang Perai'),
        ('balik_pulau', 'Balik Pulau'),
        ('air_itam', 'Air Itam'),
        ('jelutong', 'Jelutong'),
        ('tanjung_bungah', 'Tanjung Bungah'),
    ]

    EMPLOYMENT_CHOICES = [
        ('unemployed',      'Unemployed'),
        ('informal_sector', 'Informal Sector (odd jobs, hawker, daily wage)'),
        ('employed',        'Employed (formal/permanent)'),
    ]

    name = models.CharField(max_length=200)
    ic_number = models.CharField(max_length=20, unique=True)
    address = models.TextField()
    district = models.CharField(max_length=50, choices=DISTRICT_CHOICES)
    latitude = models.FloatField()
    longitude = models.FloatField()
    monthly_income = models.FloatField()
    income_category = models.CharField(max_length=20, choices=INCOME_CHOICES)
    household_size = models.PositiveIntegerField()
    has_oku = models.BooleanField(default=False)
    has_elderly = models.BooleanField(default=False)
    has_infant = models.BooleanField(default=False)

    # ── New indicators (Malaysia MPI + WFP VAM + JKM) ──────────────────────
    # WFP Coping Strategy Index + MPI Living Standards dimension
    employment_status = models.CharField(
        max_length=20, choices=EMPLOYMENT_CHOICES, default='employed', db_default='employed'
    )
    # WFP Dependency Ratio — children under 18 in household
    num_children = models.PositiveIntegerField(default=0, db_default=0)
    # JKM eligibility criterion — single-income household with children
    is_single_parent = models.BooleanField(default=False, db_default=False)

    priority_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-priority_score']

    def __str__(self):
        return f"{self.name} ({self.district})"
