from django.urls import path
from . import views

urlpatterns = [
    path('', views.RouteListView.as_view(), name='route-list'),
    path('<int:pk>/', views.RouteDetailView.as_view(), name='route-detail'),
    path('risk-score/', views.RiskScoreView.as_view(), name='risk-score'),
]