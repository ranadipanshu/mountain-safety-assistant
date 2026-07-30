import requests
from django.conf import settings
from django.core.cache import cache


def get_weather(location):
    cache_key = f"weather_{location}"
    cached = cache.get(cache_key)

    if cached:
        return cached

    api_key = settings.WEATHER_API_KEY

    if not api_key:
        # Demo data agar API key nahi hai
        return {
            'location': location,
            'temp': 12,
            'condition': 'Cloudy',
            'rainfall_3day': 35,
            'humidity': 70,
        }

    try:
        url = f"https://api.openweathermap.org/data/2.5/forecast"
        params = {
            'q': location,
            'appid': api_key,
            'units': 'metric',
        }
        response = requests.get(url, params=params)
        data = response.json()

        rainfall = sum(
            item.get('rain', {}).get('3h', 0)
            for item in data.get('list', [])[:8]
        )

        result = {
            'location': location,
            'temp': data['list'][0]['main']['temp'],
            'condition': data['list'][0]['weather'][0]['description'],
            'rainfall_3day': round(rainfall, 2),
            'humidity': data['list'][0]['main']['humidity'],
        }

        cache.set(cache_key, result, 3600)
        return result

    except Exception as e:
        return {
            'location': location,
            'temp': 10,
            'condition': 'Unknown',
            'rainfall_3day': 0,
            'humidity': 60,
            'error': str(e)
        }