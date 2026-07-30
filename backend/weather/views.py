from django.shortcuts import render

# Create your views here.

from rest_framework.views import APIView
from rest_framework.response import Response
from .services import get_weather
from .routing_service import get_route


class WeatherView(APIView):
    def get(self, request):
        location = request.query_params.get('location', 'Manali')
        weather = get_weather(location)
        return Response(weather)


class RouteView(APIView):
    def post(self, request):
        source = request.data.get('source', '')
        destination = request.data.get('destination', '')

        if not source or not destination:
            return Response({'error': 'Source aur destination dono chahiye'}, status=400)

        route = get_route(source, destination)

        if route is None:
            return Response({'error': 'API key missing'}, status=500)

        return Response(route)