import React, { useState, useEffect } from 'react'
import { useApiConfig } from '../hooks/useApiConfig'

/**
 * Debug component to show API configuration information
 * Only shown in development mode
 */
export const ApiDebugInfo: React.FC = () => {
  const { debugInfo, isDevelopment, checkBackendHealth } = useApiConfig()
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    if (isDevelopment) {
      checkBackendHealth().then(isOnline => {
        setBackendStatus(isOnline ? 'online' : 'offline')
      })
    }
  }, [isDevelopment, checkBackendHealth])

  // Only show in development
  if (!isDevelopment) {
    return null
  }

  const getStatusColor = () => {
    switch (backendStatus) {
      case 'online': return 'text-green-600'
      case 'offline': return 'text-red-600'
      case 'checking': return 'text-yellow-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = () => {
    switch (backendStatus) {
      case 'online': return '🟢'
      case 'offline': return '🔴'
      case 'checking': return '🟡'
      default: return '⚪'
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">API Debug</span>
            <span className={`text-xs ${getStatusColor()}`}>
              {getStatusIcon()} {backendStatus}
            </span>
          </div>
          <span className="text-gray-400 text-sm">
            {isExpanded ? '▼' : '▶'}
          </span>
        </div>
        
        {isExpanded && (
          <div className="mt-3 space-y-2 text-xs">
            <div>
              <span className="font-medium text-gray-600">Environment:</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded">
                {debugInfo.environment}
              </span>
            </div>
            
            <div>
              <span className="font-medium text-gray-600">Backend URL:</span>
              <div className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono break-all">
                {debugInfo.baseUrl}
              </div>
            </div>
            
            <div>
              <span className="font-medium text-gray-600">Proxy:</span>
              <span className={`ml-2 px-2 py-1 rounded ${
                debugInfo.proxyEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {debugInfo.proxyEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            
            <div>
              <span className="font-medium text-gray-600">Configured:</span>
              <span className={`ml-2 px-2 py-1 rounded ${
                debugInfo.backendUrl !== 'No configurado'
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {debugInfo.backendUrl !== 'No configurado' ? 'Yes' : 'No'}
              </span>
            </div>
            
            <button
              onClick={() => {
                setBackendStatus('checking')
                checkBackendHealth().then(isOnline => {
                  setBackendStatus(isOnline ? 'online' : 'offline')
                })
              }}
              className="w-full mt-2 px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
            >
              Check Connection
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApiDebugInfo
