import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Cargar variables de entorno
  const env = loadEnv(mode, process.cwd(), '')
  
  // Determinar la URL del backend basada en el entorno
  const getBackendUrl = () => {
    if (env.VITE_API_BASE_URL) {
      // Si hay una URL específica configurada, extraer la base
      const url = new URL(env.VITE_API_BASE_URL)
      return `${url.protocol}//${url.host}`
    }
    return 'http://localhost:8000'
  }

  const backendUrl = getBackendUrl()

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
          configure: (proxy, _options) => {
            proxy.on('error', (err, _req, _res) => {
              console.log('Proxy error:', err)
            })
            proxy.on('proxyReq', (proxyReq, req, _res) => {
              console.log('Sending Request to the Target:', req.method, req.url)
            })
            proxy.on('proxyRes', (proxyRes, req, _res) => {
              console.log('Received Response from the Target:', proxyRes.statusCode, req.url)
            })
          },
        },
      },
    },
    // Configuración para diferentes entornos
    define: {
      __APP_ENV__: JSON.stringify(mode),
      __BACKEND_URL__: JSON.stringify(backendUrl),
    },
  }
})
