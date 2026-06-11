from rest_framework import serializers
from .models import Sale, Command

class SaleSerializer(serializers.ModelSerializer):
    produit_nom = serializers.ReadOnlyField(source='produit.nom')
    class Meta:
        model = Sale
        fields = '__all__'

class CommandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Command
        fields = '__all__'
