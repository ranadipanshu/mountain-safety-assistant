from django.urls import path
from . import views

urlpatterns = [
    path('', views.WeatherView.as_view(), name='weather'),
    path('route/', views.RouteView.as_view(), name='route'),
]