from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from inventory.views import ProductViewSet
from sales.views import SaleViewSet, CommandViewSet
from iot.views import ESP32DataViewSet

router = routers.DefaultRouter()
router.register(r'products', ProductViewSet)
router.register(r'sales', SaleViewSet)
router.register(r'commands', CommandViewSet)
router.register(r'iot-data', ESP32DataViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]
