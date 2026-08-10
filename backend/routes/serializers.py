from rest_framework import serializers
from .models import Route, LandslideRecord, DangerZone


class LandslideRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandslideRecord
        fields = '__all__'


class RouteSerializer(serializers.ModelSerializer):
    landslides = LandslideRecordSerializer(many=True, read_only=True)

    class Meta:
        model = Route
        fields = '__all__'


class DangerZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = DangerZone
        fields = '__all__'