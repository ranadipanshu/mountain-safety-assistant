import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Popup, useMap, Marker, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { fetchRealRoute, fetchWeather } from '../api'
import { filterZonesNearRoute } from '../utils/geoUtils'

function FitBounds({ coordinates, extraPoints }) {
  const map = useMap()
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const allPoints = extraPoints && extraPoints.length > 0
        ? [...coordinates, ...extraPoints]
        : coordinates
      const bounds = L.latLngBounds(allPoints)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [coordinates, extraPoints, map])
  return null
}

// Coordinates verified against Wikipedia / official sources — the old
// values were off by 15-55km in several cases (e.g. Nigulsari was
// placed near Kullu when it's actually ~150km away on NH-5 in Kinnaur).
const dangerZones = [
  { lat: 30.4700, lng: 79.4900, type: 'landslide', label: 'Lambagad — Landslide Zone', color: '#ef4444', severity: 'medium' },
  { lat: 32.3710, lng: 77.2465, type: 'fog', label: 'Rohtang Pass — Heavy Fog', color: '#94a3b8', severity: 'medium' },
  { lat: 34.2789, lng: 75.4719, type: 'snow', label: 'Zoji La — Avalanche Risk', color: '#60a5fa', severity: 'high' },
  { lat: 30.2844, lng: 78.9811, type: 'flood', label: 'Rudraprayag — Flood Zone', color: '#f59e0b', severity: 'medium' },
  { lat: 31.5500, lng: 78.0000, type: 'landslide', label: 'Nigulsari (NH-5, Kinnaur) — Rockfall Zone', color: '#ef4444', severity: 'high' },
  { lat: 32.7586, lng: 77.4202, type: 'death', label: 'Baralacha La — High Death Zone', color: '#7c3aed', severity: 'high' },
  { lat: 30.7300, lng: 78.4500, type: 'flood', label: 'Uttarkashi — Flood Prone', color: '#f59e0b', severity: 'medium' },
  { lat: 32.4158, lng: 77.6485, type: 'landslide', label: 'Kunzum Pass — Landslide', color: '#ef4444', severity: 'medium' },
]

const ROUTE_PROXIMITY_KM = 15 // zone must be within this distance of the actual route to be shown

function Map({ setSelectedRoute, setRiskData }) {
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [searchedRoute, setSearchedRoute] = useState(null)
  const [nearbyZones, setNearbyZones] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [showZones, setShowZones] = useState(true)

  const computeRisk = (zones, weather) => {
    const highSeverityCount = zones.filter((z) => z.severity === 'high').length
    const landslideScore = Math.min(50, zones.length * 8 + highSeverityCount * 12)

    const rainfall = weather?.rainfall_3day ?? 0
    const condition = (weather?.condition || '').toLowerCase()
    let weatherScore = Math.min(50, rainfall * 1.2)
    if (condition.includes('rain') || condition.includes('storm')) weatherScore += 10
    if (condition.includes('snow')) weatherScore += 15
    weatherScore = Math.min(50, weatherScore)

    const total = landslideScore + weatherScore
    let level = 'safe'
    if (total >= 55) level = 'high'
    else if (total >= 25) level = 'caution'

    return { level, landslideScore, weatherScore }
  }

  const handleSearch = async () => {
    if (!source.trim() || !destination.trim()) {
      setSearchError('Source aur destination dono likho')
      return
    }
    setSearchLoading(true)
    setSearchError('')
    setSearchedRoute(null)
    setNearbyZones([])

    try {
      const res = await fetchRealRoute(source, destination)

      if (res.data.error) {
        setSearchError(res.data.error)
        setSearchLoading(false)
        return
      }

      setSearchedRoute(res.data)

      if (res.data.warning) {
        setSearchError(`⚠️ ${res.data.warning}`)
      }

      const zonesOnRoute = filterZonesNearRoute(dangerZones, res.data.coordinates, ROUTE_PROXIMITY_KM)
      setNearbyZones(zonesOnRoute)

      let weather = null
      try {
        const weatherRes = await fetchWeather(destination)
        weather = weatherRes.data
      } catch (weatherErr) {
        weather = null
      }

      const { level, landslideScore, weatherScore } = computeRisk(zonesOnRoute, weather)

      const zoneSummary = zonesOnRoute.length > 0
        ? `${zonesOnRoute.length} known danger zone${zonesOnRoute.length > 1 ? 's' : ''} is route ke ${ROUTE_PROXIMITY_KM}km ke andar hain (${zonesOnRoute.map(z => z.label.split('—')[0].trim()).join(', ')}).`
        : `Is route ke ${ROUTE_PROXIMITY_KM}km ke andar koi known danger zone nahi hai.`

      const weatherSummary = weather && !weather.error
        ? `${destination} mein abhi ${weather.condition}, ${weather.temp}°C, 3-din rainfall ~${weather.rainfall_3day}mm.`
        : `Weather data abhi available nahi hai.`

      const routeInfo = {
        name: `${source} → ${destination}`,
        risk_level: level,
        reason: `${zoneSummary} ${weatherSummary}`,
        distance_km: res.data.distance_km,
        duration_hrs: res.data.duration_hrs,
        weather,
        zones_near_route: zonesOnRoute,
        landslide_score: landslideScore,
        weather_score: weatherScore,
      }

      setSelectedRoute(routeInfo)
      setRiskData(routeInfo)
    } catch (err) {
      setSearchError('Route nahi mila — dono cities sahi likho')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Source (e.g. Manali)"
          className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500"
        />
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Destination (e.g. Leh)"
          className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={handleSearch}
          disabled={searchLoading}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          {searchLoading ? '⏳' : 'Search'}
        </button>
      </div>

      <div className="flex gap-3 mb-3">
        <button
          onClick={() => setShowZones(!showZones)}
          className={`text-xs px-3 py-1 rounded-lg border transition-colors ${showZones ? 'bg-cyan-500 text-white border-cyan-500' : 'bg-transparent text-gray-400 border-gray-600'}`}
        >
          {showZones ? '🔴 Danger Zones ON' : '⚪ Danger Zones OFF'}
        </button>
      </div>

      {searchError && (
        <p className="text-red-400 text-xs mb-2">{searchError}</p>
      )}

      <div className="rounded-xl overflow-hidden" style={{ height: '420px' }}>
        <MapContainer
          center={[32.0, 77.5]}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />

          {showZones && (searchedRoute ? nearbyZones : dangerZones).map((zone, index) => (
            <Circle
              key={index}
              center={[zone.lat, zone.lng]}
              radius={8000}
              pathOptions={{
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.3,
              }}
            >
              <Popup>
                <div style={{ minWidth: '160px' }}>
                  <strong>{zone.label}</strong>
                  <br />
                  <span style={{ color: zone.color, fontWeight: 'bold' }}>
                    {zone.type === 'landslide' ? '🔴 Landslide Zone' :
                      zone.type === 'fog' ? '🌫️ Fog Zone' :
                        zone.type === 'snow' ? '❄️ Avalanche Risk' :
                          zone.type === 'flood' ? '🌊 Flood Zone' :
                            '💀 High Death Zone'}
                  </span>
                  {zone.distance_km !== undefined && (
                    <>
                      <br />
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                        Route se ~{zone.distance_km} km door
                      </span>
                    </>
                  )}
                </div>
              </Popup>
            </Circle>
          ))}

          {searchedRoute && searchedRoute.coordinates && (
            <>
              <FitBounds
                coordinates={searchedRoute.coordinates}
                extraPoints={nearbyZones.map((z) => [z.lat, z.lng])}
              />
              <Polyline
                positions={searchedRoute.coordinates}
                color="#00d4ff"
                weight={5}
              >
                <Popup>
                  <div style={{ minWidth: '180px' }}>
                    <strong>{source} → {destination}</strong>
                    <br />
                    <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                      🟡 Caution — Mountain Route
                    </span>
                  </div>
                </Popup>
              </Polyline>
            </>
          )}

        </MapContainer>
      </div>

      <div className="flex gap-4 mt-3 px-2 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span> Landslide
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-full bg-slate-400 inline-block"></span> Fog
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-full bg-blue-400 inline-block"></span> Avalanche
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Flood
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-full bg-purple-600 inline-block"></span> High Death
        </span>
        <span className="flex items-center gap-1 text-xs text-gray-400">
          <span className="w-3 h-3 rounded-full bg-cyan-400 inline-block"></span> Route
        </span>
      </div>

      {!searchedRoute && (
        <div className="text-center mt-3 text-gray-500 text-sm">
          Source aur destination type karo — real road route map pe dikhega
        </div>
      )}

      {searchedRoute && (
        <div className="text-center mt-3 text-gray-500 text-sm">
          {nearbyZones.length > 0
            ? `⚠️ ${nearbyZones.length} danger zone(s) is route ke ${ROUTE_PROXIMITY_KM}km ke andar mile`
            : `✅ Is route ke ${ROUTE_PROXIMITY_KM}km ke andar koi known danger zone nahi hai`}
        </div>
      )}
    </div>
  )
}

export default Map