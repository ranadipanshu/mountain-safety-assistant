from django.contrib import admin

# Register your models here.

from django.contrib import admin
from .models import Route, LandslideRecord

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ['name', 'source', 'destination', 'risk_level']
    list_filter = ['risk_level']

@admin.register(LandslideRecord)
class LandslideRecordAdmin(admin.ModelAdmin):
    list_display = ['route', 'location', 'year', 'severity']