from rest_framework import serializers
from .models import ESP32Data

class ESP32DataSerializer(serializers.ModelSerializer):
    class Meta:
        model = ESP32Data
        fields = '__all__'
