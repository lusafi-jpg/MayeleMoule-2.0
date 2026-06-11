from rest_framework import viewsets
from .models import ESP32Data
from .serializers import ESP32DataSerializer

class ESP32DataViewSet(viewsets.ModelViewSet):
    queryset = ESP32Data.objects.all().order_by('-timestamp')
    serializer_class = ESP32DataSerializer
