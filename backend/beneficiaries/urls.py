from rest_framework.routers import DefaultRouter
from .views import BeneficiaryViewSet

router = DefaultRouter()
router.register(r'', BeneficiaryViewSet, basename='beneficiary')

urlpatterns = router.urls
