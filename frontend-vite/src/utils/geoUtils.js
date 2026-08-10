// Real geometry-based helpers — used to figure out which danger zones
// actually sit near a given route, instead of always showing every
// zone or matching by city-name text.

const EARTH_RADIUS_KM = 6371

function toRad(deg) {
  return (deg * Math.PI) / 180
}

export function haversineKm([lat1, lng1], [lat2, lng2]) {
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return EARTH_RADIUS_KM * c
}

export function distanceToRouteKm(point, routeCoordinates) {
  if (!routeCoordinates || routeCoordinates.length === 0) return Infinity
  const step = Math.max(1, Math.floor(routeCoordinates.length / 500))
  let min = Infinity
  for (let i = 0; i < routeCoordinates.length; i += step) {
    const d = haversineKm(point, routeCoordinates[i])
    if (d < min) min = d
  }
  return min
}

export function filterZonesNearRoute(zones, routeCoordinates, thresholdKm = 15) {
  return zones
    .map((zone) => ({
      ...zone,
      distance_km: Math.round(distanceToRouteKm([zone.lat, zone.lng], routeCoordinates) * 10) / 10,
    }))
    .filter((zone) => zone.distance_km <= thresholdKm)
    .sort((a, b) => a.distance_km - b.distance_km)
}