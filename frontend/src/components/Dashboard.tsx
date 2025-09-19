import React from 'react'
import { useCVScreener } from '../contexts/CVScreenerContext'
import { BarChart3, FileText, Users, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const { state } = useCVScreener()

  const stats = [
    {
      name: 'CVs Procesados',
      value: state.cvFiles.length.toString(),
      icon: FileText,
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      name: 'Descripciones de Trabajo',
      value: state.jobDescriptions.length.toString(),
      icon: Users,
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      name: 'Puntuación Promedio',
      value: '8.2',
      icon: TrendingUp,
      change: '+2.1%',
      changeType: 'positive' as const,
    },
    {
      name: 'Análisis Completados',
      value: state.cvFiles.filter(cv => cv.status === 'processed').length.toString(),
      icon: BarChart3,
      change: '+15%',
      changeType: 'positive' as const,
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Resumen del sistema de screening de CVs con IA
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <stat.icon className="h-8 w-8 text-primary-600" />
              </div>
              <div className="ml-4 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {stat.name}
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </div>
                    <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.change}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            CVs Recientes
          </h3>
          <div className="space-y-3">
            {state.cvFiles.slice(0, 5).map((cv) => (
              <div key={cv.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    {cv.filename}
                  </span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  cv.status === 'processed'
                    ? 'bg-green-100 text-green-800'
                    : cv.status === 'processing'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {cv.status}
                </span>
              </div>
            ))}
            {state.cvFiles.length === 0 && (
              <p className="text-sm text-gray-500">No hay CVs procesados aún</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Acciones Rápidas
          </h3>
          <div className="space-y-3">
            <button className="w-full btn-primary text-left">
              Subir Nuevo CV
            </button>
            <button className="w-full btn-secondary text-left">
              Crear Descripción de Trabajo
            </button>
            <button className="w-full btn-secondary text-left">
              Iniciar Chat con IA
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
