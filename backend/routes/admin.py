from django.contrib import admin
from .models import Route, LandslideRecord, DangerZone

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ['name', 'source', 'destination', 'risk_level']
    list_filter = ['risk_level']

@admin.register(LandslideRecord)
class LandslideRecordAdmin(admin.ModelAdmin):
    list_display = ['route', 'location', 'year', 'severity']

@admin.register(DangerZone)
class DangerZoneAdmin(admin.ModelAdmin):
    list_display = ['route_name', 'zone_type', 'label', 'severity']
    list_filter = ['zone_type', 'severity', 'route_name']