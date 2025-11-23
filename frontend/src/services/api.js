import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // Port ของ Backend Elysia
  headers: {
    'Content-Type': 'application/json'
  }
})

export default api