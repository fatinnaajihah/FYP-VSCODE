from django.contrib import admin
from .models import Beneficiary

@admin.register(Beneficiary)
class BeneficiaryAdmin(admin.ModelAdmin):
    list_display = ['name', 'district', 'income_category', 'household_size',
                    'has_oku', 'has_elderly', 'priority_score']
    list_filter = ['district', 'income_category', 'has_oku', 'has_elderly', 'has_infant']
    search_fields = ['name', 'ic_number', 'address']
    ordering = ['-priority_score']
