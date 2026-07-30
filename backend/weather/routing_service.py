import requests


def get_coordinates(city_name):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        'q': city_name + ', India',
        'format': 'json',
        'limit': 1,
    }
    headers = {'User-Agent': 'MountainTravelAssistant/1.0'}
    res = requests.get(url, params=params, headers=headers)
    data = res.json()

    if not data:
        return None

    lat = float(data[0]['lat'])
    lon = float(data[0]['lon'])
    return lon, lat


def get_route(source, destination):
    source = source.strip().title()
    destination = destination.strip().title()

    try:
        source_coords = get_coordinates(source)
        if not source_coords:
            return {'error': f'Source city not found: {source}'}

        dest_coords = get_coordinates(destination)
        if not dest_coords:
            return {'error': f'Destination city not found: {destination}'}

        # OSRM — free routing, no API key
        url = f"http://router.project-osrm.org/route/v1/driving/{source_coords[0]},{source_coords[1]};{dest_coords[0]},{dest_coords[1]}?overview=full&geometries=geojson"

        res = requests.get(url)
        data = res.json()

        if data.get('code') != 'Ok':
            return {'error': 'Route not found'}

        coords = data['routes'][0]['geometry']['coordinates']
        leaflet_coords = [[c[1], c[0]] for c in coords]

        distance_km = round(data['routes'][0]['distance'] / 1000, 1)
        duration_hrs = round(data['routes'][0]['duration'] / 3600, 1)

        return {
            'coordinates': leaflet_coords,
            'source': source,
            'destination': destination,
            'distance_km': distance_km,
            'duration_hrs': duration_hrs,
        }

    except Exception as e:
        return {'error': str(e)}