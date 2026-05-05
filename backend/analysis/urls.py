from rest_framework.routers import DefaultRouter
from .views import GAGenerationMetricViewSet

router = DefaultRouter()
router.register(r'metrics', GAGenerationMetricViewSet, basename='metrics')

urlpatterns = router.urls
