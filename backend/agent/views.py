from django.shortcuts import render

# Create your views here.

from rest_framework.views import APIView
from rest_framework.response import Response
from .agent_service import get_agent_response


class AgentView(APIView):
    def post(self, request):
        user_message = request.data.get('message', '')
        selected_route = request.data.get('route', None)

        response = get_agent_response(user_message, selected_route)

        return Response({
            'reply': response
        })