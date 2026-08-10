import requests

# Uttarakhand's rough bounding box (min_lon, min_lat, max_lon, max_lat).
UTTARAKHAND_VIEWBOX = "77.5,31.5,81.1,28.7"

_SETTLEMENT_TYPE_PRIORITY = ['city', 'town', 'village', 'hamlet', 'suburb']

# Rishikesh — (lon, lat). This is the real-world "gateway" town: almost
# every road route from Dehradun/Haridwar into the Garhwal Himalaya
# (Devprayag, Srinagar, Pauri, Rudraprayag, Kedarnath, Badrinath,
# Joshimath, Chamoli...) goes through here. Left to itself, OSRM will
# sometimes pick an alternate hill road (e.g. via Mussoorie-Tehri) that
# is technically drivable but isn't the actual conventional/maintained
# route — so we force the waypoint instead of trusting "fastest" blindly.
RISHIKESH_COORDS = (78.2676, 30.0869)

# Plains gateway towns people actually start from.
_PLAINS_SOURCE_NAMES = {'dehradun', 'haridwar'}

# Garhwal Himalaya belt (lon_min, lat_min, lon_max, lat_max) — covers
# Tehri, Pauri, Rudraprayag, Chamoli districts (Devprayag, Srinagar,
# Pauri, Kedarnath, Badrinath, Joshimath all fall inside). Deliberately
# excludes Kumaon (Almora/Nainital, lower latitude) which is reached via
# a different gateway (Haldwani), not Rishikesh.
_GARHWAL_BELT = (78.3, 29.8, 80.3, 31.3)


def _rank_result(item):
    if item.get('class') != 'place':
        return len(_SETTLEMENT_TYPE_PRIORITY) + 1
    t = item.get('type')
    return _SETTLEMENT_TYPE_PRIORITY.index(t) if t in _SETTLEMENT_TYPE_PRIORITY else len(_SETTLEMENT_TYPE_PRIORITY)


def get_coordinates(city_name):
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        'q': city_name + ', Uttarakhand, India',
        'format': 'json',
        'limit': 5,
        'viewbox': UTTARAKHAND_VIEWBOX,
        'bounded': 1,
    }
    headers = {'User-Agent': 'MountainTravelAssistant/1.0'}
    res = requests.get(url, params=params, headers=headers)
    data = res.json()

    if not data:
        params.pop('viewbox')
        params.pop('bounded')
        params['q'] = city_name + ', India'
        res = requests.get(url, params=params, headers=headers)
        data = res.json()
        if not data:
            return None

    best = min(data, key=_rank_result)

    lat = float(best['lat'])
    lon = float(best['lon'])
    return lon, lat


def _should_route_via_rishikesh(source_name, dest_coords):
    lon_min, lat_min, lon_max, lat_max = _GARHWAL_BELT
    dest_lon, dest_lat = dest_coords
    is_dest_in_garhwal_belt = lon_min <= dest_lon <= lon_max and lat_min <= dest_lat <= lat_max
    is_source_plains = source_name.strip().lower() in _PLAINS_SOURCE_NAMES
    return is_source_plains and is_dest_in_garhwal_belt


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

        route_points = [source_coords]
        if _should_route_via_rishikesh(source, dest_coords):
            route_points.append(RISHIKESH_COORDS)
        route_points.append(dest_coords)

        # OSRM — free routing, no API key
        coord_str = ';'.join(f"{lon},{lat}" for lon, lat in route_points)
        url = f"http://router.project-osrm.org/route/v1/driving/{coord_str}?overview=full&geometries=geojson"

        res = requests.get(url)
        data = res.json()

        if data.get('code') != 'Ok':
            return {'error': 'Route not found'}

        coords = data['routes'][0]['geometry']['coordinates']
        leaflet_coords = [[c[1], c[0]] for c in coords]

        distance_km = round(data['routes'][0]['distance'] / 1000, 1)
        duration_hrs = round(data['routes'][0]['duration'] / 3600, 1)

        # OSRM snaps each input point to the nearest road it knows
        # about. For places with no road access at all (Kedarnath,
        # Hemkund Sahib, Yamunotri's last stretch — all reached on
        # foot), that snap can land several km away, and the "route"
        # silently stops short of the real destination without saying
        # so. Surface it instead of pretending it's exact.
        warning = None
        waypoints = data.get('waypoints', [])
        if waypoints:
            dest_snap_km = round(waypoints[-1].get('distance', 0) / 1000, 1)
            if dest_snap_km > 2:
                warning = (
                    f"{destination} tak seedhi road connectivity nahi mili — "
                    f"nearest motorable road se ~{dest_snap_km}km door hai "
                    f"(aage trek/pedal se jaana padta hai, jaise Kedarnath/Hemkund Sahib)."
                )

        return {
            'coordinates': leaflet_coords,
            'source': source,
            'destination': destination,
            'distance_km': distance_km,
            'duration_hrs': duration_hrs,
            'warning': warning,
        }

    except Exception as e:
        return {'error': str(e)}