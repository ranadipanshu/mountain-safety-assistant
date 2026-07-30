import { useState, useEffect } from 'react'

const useWeather = (location) => {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!location) return

    setLoading(true)
    setError(null)

    setTimeout(() => {
      const dummyWeather = {
        location: location,
        temp: Math.floor(Math.random() * 15) + 5,
        condition: ['Clear', 'Foggy', 'Heavy Rain', 'Cloudy'][
          Math.floor(Math.random() * 4)
        ],
        rainfall_3day: Math.floor(Math.random() * 60),
        humidity: Math.floor(Math.random() * 40) + 50,
      }
      setWeather(dummyWeather)
      setLoading(false)
    }, 800)

  }, [location])

  return { weather, loading, error }
}

export default useWeather