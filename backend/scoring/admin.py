from django.contrib import admin
from .models import PriorityCriteria

@admin.register(PriorityCriteria)
class PriorityCriteriaAdmin(admin.ModelAdmin):
    list_display = ['income_weight', 'household_size_weight', 'oku_weight',
                    'elderly_weight', 'infant_weight', 'updated_at']
