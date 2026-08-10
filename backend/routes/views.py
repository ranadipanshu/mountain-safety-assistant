from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Route, LandslideRecord, DangerZone
from .serializers import RouteSerializer, DangerZoneSerializer


class RouteListView(generics.ListAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer


class RouteDetailView(generics.RetrieveAPIView):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer


class RiskScoreView(APIView):
    def post(self, request):
        route_id = request.data.get('route_id')
        weather_data = request.data.get('weather', {})

        try:
            route = Route.objects.get(id=route_id)
            landslide_count = route.landslides.count()

            rainfall = weather_data.get('rainfall_3day', 0)
            weather_score = min(40, rainfall * 0.8)
            landslide_score = min(40, landslide_count * 4)

            total = weather_score + landslide_score

            if total < 30:
                level = 'safe'
            elif total < 60:
                level = 'caution'
            else:
                level = 'high'

            return Response({
                'route': route.name,
                'risk_level': level,
                'score': total,
                'weather_score': weather_score,
                'landslide_score': landslide_score,
            })
        except Route.DoesNotExist:
            return Response({'error': 'Route not found'}, status=404)


class DangerZoneView(APIView):
    def get(self, request):
        source = request.query_params.get('source', '').strip().title()
        destination = request.query_params.get('destination', '').strip().title()

        route_name = f"{source} - {destination}"
        zones = DangerZone.objects.filter(route_name__icontains=source) | DangerZone.objects.filter(
            route_name__icontains=destination)
        serializer = DangerZoneSerializer(zones, many=True)
        return Response(serializer.data)