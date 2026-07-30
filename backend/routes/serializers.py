from rest_framework import serializers
from .models import Route, LandslideRecord


class LandslideRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandslideRecord
        fields = '__all__'


class RouteSerializer(serializers.ModelSerializer):
    landslides = LandslideRecordSerializer(many=True, read_only=True)

    class Meta:
        model = Route
        fields = '__all__'