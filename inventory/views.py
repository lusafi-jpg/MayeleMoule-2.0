from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Product
from .serializers import ProductSerializer

class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

    @action(detail=False, methods=['get'])
    def promotions(self, request):
        promos = Product.objects.exclude(offre_promo__exact='').exclude(offre_promo__isnull=True)
        return Response(self.get_serializer(promos, many=True).data)
