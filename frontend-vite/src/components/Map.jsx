import React, { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, Popup, useMap, Marker, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { fetchRealRoute } from '../api'

function FitBounds({ coordinates }) {
  const map = useMap()
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [coordinates, map])
  return null
}

const dangerZones = [
  { lat: 30.4598, lng: 79.0624, type: 'landslide', label: 'Lambagad — Landslide Zone', color: '#ef4444' },
  { lat: 32.4749, lng: 77.6220, type: 'fog', label: 'Rohtang Pass — Heavy Fog', color: '#94a3b8' },
  { lat: 34.2268, lng: 75.6420, type: 'snow', label: 'Zoji La — Avalanche Risk', color: '#60a5fa' },
  { lat: 30.7352, lng: 79.0669, type: 'flood', label: 'Rudraprayag — Flood Zone', color: '#f59e0b' },
  { lat: 31.3260, lng: 77.4200, type: 'landslide', label: 'Nigulseri — Rockfall Zone', color: '#ef4444' },
  { lat: 33.0565, lng: 77.8526, type: 'death', label: 'Baralacha La — High Death Zone', color: '#7c3aed' },
  { lat: 30.6800, lng: 78.7500, type: 'flood', label: 'Uttarkashi — Flood Prone', color: '#f59e0b' },
  { lat: 31.9245, lng: 77.6287, type: 'landslide', label: 'Kunzum Pass — Landslide', color: '#ef4444' },
]

function Map({ setSelectedRoute, setRiskData }) {
  const [source, setSource] = useState('')
  const [destination, setDestination] = useState('')
  const [searchedRoute, setSearchedRoute] = useState(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [showZones, setShowZones] = useState(true)

  const handleSearch = async () => {
    if (!source.trim() || !destination.trim()) {
      setSearchError('Source aur destination dono likho')
      return
    }
    setSearchLoading(true)
    setSearchError('')
    setSearchedRoute(null)

    try {
      const res = await fetchRealRoute(source, destination)
      setSearchedRoute(res.data)
      setSelectedRoute({
        name: `${source} → ${destination}`,
        risk_level: 'caution',
        reason: 'Real-time route — OpenRouteService se fetch kiya gaya',
      })
      setRiskData({
        name: `${source} → ${destination}`,
        risk_level: 'caution',
        reason: 'Real-time route fetched from OSRM — check danger zones on map',
        distance_km: res.data.distance_km,
        duration_hrs: res.data.duration_hrs,
      })
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

          {showZones && dangerZones.map((zone, index) => (
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
                </div>
              </Popup>
            </Circle>
          ))}

          {searchedRoute && searchedRoute.coordinates && (
            <>
              <FitBounds coordinates={searchedRoute.coordinates} />
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
    </div>
  )
}

export default Map
