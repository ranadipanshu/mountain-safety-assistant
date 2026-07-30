import React, { useState } from 'react'
import Map from '../components/Map'
import Chat from '../components/Chat'
import RiskCard from '../components/RiskCard'

function Home() {
  const [selectedRoute, setSelectedRoute] = useState(null)
  const [riskData, setRiskData] = useState(null)

  return (
    <div className="min-h-screen bg-gray-950 p-4">
      <div className="max-w-7xl mx-auto">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white">
            🏔️ Mountain Travel Safety
          </h1>
          <p className="text-gray-400 mt-1">
            Real-time route risk analysis for safe mountain travel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          <div className="lg:col-span-2 bg-gray-900 border border-gray-700 rounded-2xl p-4">
            <h2 className="text-white font-semibold mb-3">
              🗺️ Route Map
            </h2>
            <Map
              selectedRoute={selectedRoute}
              setSelectedRoute={setSelectedRoute}
              setRiskData={setRiskData}
            />
          </div>

          <div className="flex flex-col gap-4">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4">
              <h2 className="text-white font-semibold mb-3">
                ⚠️ Risk Analysis
              </h2>
              <RiskCard riskData={riskData} />
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-4 flex-1">
              <h2 className="text-white font-semibold mb-3">
                🤖 AI Assistant
              </h2>
              <Chat selectedRoute={selectedRoute} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Home