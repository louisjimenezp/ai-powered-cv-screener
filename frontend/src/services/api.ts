import axios from 'axios'
import { CVScreeningRequest, CVScreeningResponse, ScreeningCriteria, UploadResponse } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const cvScreenerAPI = {
  // Analizar CV
  async analyzeCV(request: CVScreeningRequest): Promise<CVScreeningResponse> {
    const response = await api.post('/screening/analyze', request)
    return response.data
  },

  // Subir archivo CV
  async uploadCV(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post('/screening/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Obtener criterios de screening
  async getScreeningCriteria(): Promise<ScreeningCriteria> {
    const response = await api.get('/screening/criteria')
    return response.data
  },

  // Verificar salud del sistema
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await api.get('/health')
    return response.data
  },
}

export default api
