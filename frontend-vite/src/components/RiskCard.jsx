import React from 'react'

function RiskCard({ riskData }) {
  if (!riskData) {
    return (
      <div className="text-center py-8">
        <span className="text-4xl">🗺️</span>
        <p className="text-gray-400 mt-3 text-sm">
          Source aur destination type karo — risk analysis dikhega
        </p>
      </div>
    )
  }

  const risk = riskData.risk_level || riskData.risk

  const riskConfig = {
    safe: {
      color: 'text-green-400',
      bg: 'bg-green-900/30',
      border: 'border-green-700',
      icon: '✅',
      label: 'Safe',
    },
    caution: {
      color: 'text-amber-400',
      bg: 'bg-amber-900/30',
      border: 'border-amber-700',
      icon: '⚠️',
      label: 'Caution',
    },
    high: {
      color: 'text-red-400',
      bg: 'bg-red-900/30',
      border: 'border-red-700',
      icon: '🔴',
      label: 'High Risk',
    },
  }

  const config = riskConfig[risk] || riskConfig['caution']

  return (
    <div className={`rounded-xl border p-4 ${config.bg} ${config.border}`}>

      <div className="flex items-center gap-2 mb-3">
        <span className="text-2xl">{config.icon}</span>
        <div>
          <p className="text-white font-semibold text-sm">
            {riskData.name}
          </p>
          <p className={`font-bold text-lg ${config.color}`}>
            {config.label}
          </p>
        </div>
      </div>

      <div className={`border-t ${config.border} pt-3`}>
        <p className="text-gray-300 text-sm leading-relaxed">
          {riskData.reason}
        </p>
      </div>

      {riskData.distance_km && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-gray-800 rounded-lg p-2 text-center">
            <p className="text-gray-400 text-xs">Distance</p>
            <p className="text-white text-sm font-semibold mt-1">
              🛣️ {riskData.distance_km} km
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-2 text-center">
            <p className="text-gray-400 text-xs">Duration</p>
            <p className="text-white text-sm font-semibold mt-1">
              ⏱️ {riskData.duration_hrs} hrs
            </p>
          </div>
        </div>
      )}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="bg-gray-800 rounded-lg p-2 text-center">
          <p className="text-gray-400 text-xs">Weather</p>
          <p className="text-white text-sm font-semibold mt-1">
            {risk === 'high' ? '🌧️ Heavy Rain' :
             risk === 'caution' ? '🌫️ Foggy' : '☀️ Clear'}
          </p>
        </div>
        <div className="bg-gray-800 rounded-lg p-2 text-center">
          <p className="text-gray-400 text-xs">Landslide</p>
          <p className="text-white text-sm font-semibold mt-1">
            {risk === 'high' ? '🔴 High' :
             risk === 'caution' ? '🟡 Medium' : '🟢 Low'}
          </p>
        </div>
      </div>

    </div>
  )
}

export default RiskCard