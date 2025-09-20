/**
 * Configuración centralizada de la API
 * Este archivo maneja todas las URLs y configuraciones relacionadas con el backend
 */

export interface ApiConfig {
  baseUrl: string
  timeout: number
  retries: number
  debug: boolean
}

/**
 * Obtiene la configuración de la API basada en el entorno actual
 */
export const getApiConfig = (): ApiConfig => {
  const isDevelopment = import.meta.env.DEV
  
  // URL base del backend
  const getBaseUrl = (): string => {
    // En desarrollo, usar proxy de Vite si no hay URL específica
    if (isDevelopment && !import.meta.env.VITE_API_BASE_URL) {
      return '/api/v1'
    }
    
    // Usar la variable de entorno o fallback
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'
  }

  return {
    baseUrl: getBaseUrl(),
    timeout: 30000, // 30 segundos
    retries: 3,
    debug: import.meta.env.VITE_DEBUG_MODE === 'true' || isDevelopment,
  }
}

/**
 * URLs específicas de endpoints
 */
export const API_ENDPOINTS = {
  // Screening
  ANALYZE_CV: '/screening/analyze',
  UPLOAD_CV: '/screening/upload',
  
  // Health
  HEALTH: '/health',
  
  // Chat/RAG
  CHAT: '/chat',
  QUERY: '/query',
} as const

/**
 * Configuración de headers por defecto
 */
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
} as const

/**
 * Configuración de headers para uploads
 */
export const UPLOAD_HEADERS = {
  'Content-Type': 'multipart/form-data',
} as const

/**
 * Mensajes de error personalizados
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Error de conexión. Verifica que el backend esté ejecutándose.',
  TIMEOUT_ERROR: 'La solicitud tardó demasiado tiempo en completarse.',
  SERVER_ERROR: 'Error interno del servidor. Intenta nuevamente más tarde.',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción.',
  NOT_FOUND: 'El recurso solicitado no fue encontrado.',
} as const

/**
 * Función para construir URLs completas
 */
export const buildApiUrl = (endpoint: string): string => {
  const config = getApiConfig()
  const baseUrl = config.baseUrl.endsWith('/') ? config.baseUrl.slice(0, -1) : config.baseUrl
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${cleanEndpoint}`
}

/**
 * Función para verificar si el backend está disponible
 */
export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(buildApiUrl(API_ENDPOINTS.HEALTH), {
      method: 'GET',
      headers: DEFAULT_HEADERS,
    })
    return response.ok
  } catch (error) {
    console.error('Backend health check failed:', error)
    return false
  }
}

/**
 * Información de debug para desarrollo
 */
export const getDebugInfo = () => {
  const config = getApiConfig()
  return {
    environment: import.meta.env.MODE,
    isDevelopment: import.meta.env.DEV,
    isProduction: import.meta.env.PROD,
    baseUrl: config.baseUrl,
    backendUrl: import.meta.env.VITE_API_BASE_URL || 'No configurado',
    proxyEnabled: import.meta.env.DEV && !import.meta.env.VITE_API_BASE_URL,
  }
}
