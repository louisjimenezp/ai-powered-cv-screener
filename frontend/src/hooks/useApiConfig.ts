import { useMemo } from 'react'
import { getApiConfig, getDebugInfo, checkBackendHealth } from '../config/api'

/**
 * Custom hook to access API configuration
 * Provides real-time information about backend configuration
 */
export const useApiConfig = () => {
  const config = useMemo(() => getApiConfig(), [])
  const debugInfo = useMemo(() => getDebugInfo(), [])

  return {
    // Main configuration
    baseUrl: config.baseUrl,
    timeout: config.timeout,
    retries: config.retries,
    debug: config.debug,
    
    // Debug information
    debugInfo,
    
    // Utility functions
    checkBackendHealth,
    
    // Environment information
    isDevelopment: debugInfo.isDevelopment,
    isProduction: debugInfo.isProduction,
    environment: debugInfo.environment,
  }
}

/**
 * Hook to check backend connection status
 */
export const useBackendStatus = () => {
  const { checkBackendHealth, baseUrl } = useApiConfig()
  
  return {
    baseUrl,
    checkHealth: checkBackendHealth,
  }
}
