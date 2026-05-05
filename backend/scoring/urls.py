from rest_framework.routers import DefaultRouter
from .views import PriorityCriteriaViewSet

router = DefaultRouter()
router.register(r'criteria', PriorityCriteriaViewSet, basename='criteria')

urlpatterns = router.urls
