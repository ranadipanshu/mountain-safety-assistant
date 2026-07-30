from django.urls import path
from . import views

urlpatterns = [
    path('', views.AgentView.as_view(), name='agent'),
]