from rest_framework.routers import DefaultRouter
from .views import AllocationRunViewSet

router = DefaultRouter()
router.register(r'runs', AllocationRunViewSet, basename='runs')

urlpatterns = router.urls
