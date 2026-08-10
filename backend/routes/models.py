from django.db import models

class Route(models.Model):
    name = models.CharField(max_length=200)
    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    risk_level = models.CharField(max_length=20, choices=[
        ('safe', 'Safe'),
        ('caution', 'Caution'),
        ('high', 'High Risk'),
    ])
    reason = models.TextField()
    coordinates = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class LandslideRecord(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name='landslides')
    location = models.CharField(max_length=200)
    year = models.IntegerField()
    severity = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ])
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.route.name} - {self.year}"

class DangerZone(models.Model):
    route_name = models.CharField(max_length=200)
    lat = models.FloatField()
    lng = models.FloatField()
    zone_type = models.CharField(max_length=50, choices=[
        ('landslide', 'Landslide'),
        ('fog', 'Fog'),
        ('flood', 'Flood'),
        ('death', 'High Death Zone'),
        ('traffic', 'Heavy Traffic'),
        ('snow', 'Snow/Avalanche'),
    ])
    label = models.CharField(max_length=200)
    severity = models.CharField(max_length=20, choices=[
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
    ], default='medium')

    def __str__(self):
        return f"{self.route_name} - {self.zone_type}"