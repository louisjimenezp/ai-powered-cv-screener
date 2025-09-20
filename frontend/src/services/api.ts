import axios from 'axios'
import { CVScreeningRequest, CVScreeningResponse, ScreeningCriteria, UploadResponse } from '../types'
import { getApiConfig, API_ENDPOINTS, DEFAULT_HEADERS, UPLOAD_HEADERS, ERROR_MESSAGES } from '../config/api'

// Configuración centralizada de la API
const config = getApiConfig()

const api = axios.create({
  baseURL: config.baseUrl,
  timeout: config.timeout,
  headers: DEFAULT_HEADERS,
})

// Interceptor para manejar errores con mensajes personalizados
api.interceptors.response.use(
  (response) => {
    // Log de éxito en modo debug
    if (config.debug) {
      console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`, {
        status: response.status,
        data: response.data,
      })
    }
    return response
  },
  (error) => {
    // Log de error detallado
    if (config.debug) {
      console.error('❌ API Error:', {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      })
    }

    // Mensajes de error personalizados
    let errorMessage = error.message
    
    if (error.code === 'ECONNABORTED') {
      errorMessage = ERROR_MESSAGES.TIMEOUT_ERROR
    } else if (error.code === 'ERR_NETWORK') {
      errorMessage = ERROR_MESSAGES.NETWORK_ERROR
    } else if (error.response?.status === 401) {
      errorMessage = ERROR_MESSAGES.UNAUTHORIZED
    } else if (error.response?.status === 404) {
      errorMessage = ERROR_MESSAGES.NOT_FOUND
    } else if (error.response?.status >= 500) {
      errorMessage = ERROR_MESSAGES.SERVER_ERROR
    }

    // Crear error personalizado con mensaje mejorado
    const customError = new Error(errorMessage)
    // @ts-ignore - cause es una propiedad estándar en Error pero no está en el tipo de TypeScript
    customError.cause = error
    
    return Promise.reject(customError)
  }
)

// Interceptor para requests (logging en modo debug)
api.interceptors.request.use(
  (config) => {
    if (getApiConfig().debug) {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        baseURL: config.baseURL,
        headers: config.headers,
        data: config.data,
      })
    }
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

export const cvScreenerAPI = {
  // Analizar CV
  async analyzeCV(request: CVScreeningRequest): Promise<CVScreeningResponse> {
    const response = await api.post(API_ENDPOINTS.ANALYZE_CV, request)
    return response.data
  },

  // Subir archivo CV
  async uploadCV(file: File): Promise<UploadResponse> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post(API_ENDPOINTS.UPLOAD_CV, formData, {
      headers: UPLOAD_HEADERS,
    })
    return response.data
  },

  // Obtener criterios de screening
  async getScreeningCriteria(): Promise<ScreeningCriteria> {
    const response = await api.get(API_ENDPOINTS.SCREENING_CRITERIA)
    return response.data
  },

  // Verificar salud del sistema
  async healthCheck(): Promise<{ status: string; message: string }> {
    const response = await api.get(API_ENDPOINTS.HEALTH)
    return response.data
  },
}

export default api
