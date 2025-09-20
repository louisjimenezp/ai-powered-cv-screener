import { useMemo } from 'react'
import { getApiConfig, getDebugInfo, checkBackendHealth } from '../config/api'

/**
 * Hook personalizado para acceder a la configuración de la API
 * Proporciona información en tiempo real sobre la configuración del backend
 */
export const useApiConfig = () => {
  const config = useMemo(() => getApiConfig(), [])
  const debugInfo = useMemo(() => getDebugInfo(), [])

  return {
    // Configuración principal
    baseUrl: config.baseUrl,
    timeout: config.timeout,
    retries: config.retries,
    debug: config.debug,
    
    // Información de debug
    debugInfo,
    
    // Funciones utilitarias
    checkBackendHealth,
    
    // Información del entorno
    isDevelopment: debugInfo.isDevelopment,
    isProduction: debugInfo.isProduction,
    environment: debugInfo.environment,
  }
}

/**
 * Hook para verificar el estado de conexión del backend
 */
export const useBackendStatus = () => {
  const { checkBackendHealth, baseUrl } = useApiConfig()
  
  return {
    baseUrl,
    checkHealth: checkBackendHealth,
  }
}
