import axios from 'axios'

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
})

export const fetchRoutes = () => API.get('/routes/')
export const fetchWeather = (location) => API.get(`/weather/?location=${location}`)
export const askAgent = (message, route) => API.post('/agent/', { message, route })
export const fetchRealRoute = (source, destination) => API.post('/weather/route/', { source, destination })