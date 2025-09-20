import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { cvScreenerAPI } from '../services/api'
import { FileText, CheckCircle, XCircle, TrendingUp, RefreshCw } from 'lucide-react'
import { FileMetadata } from '../types'
import { ROUTES } from '../utils/routes'

export default function Dashboard() {
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Load files from backend when component mounts
  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      setLoading(true)
      const response = await cvScreenerAPI.listCVs()
      setFiles(response.files)
    } catch (err) {
      console.error('Error loading files:', err)
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    {
      name: 'Total CVs',
      value: files.length.toString(),
      icon: FileText,
    },
    {
      name: 'Processed CVs', 
      value: files.filter(file => file.status === 'processed').length.toString(),
      icon: CheckCircle,
    },
    {
      name: 'Failed CVs',
      value: files.filter(file => file.status === 'error').length.toString(),
      icon: XCircle,
    },
    {
      name: 'Success Rate',
      value: files.length > 0 
        ? `${Math.round((files.filter(file => file.status === 'processed').length / files.length) * 100)}%`
        : '0%',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-8">
      <div className="hidden md:flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            AI-powered CV screening system overview
          </p>
        </div>
        <button
          onClick={loadFiles}
          disabled={loading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
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
                  <dd>
                    <div className="text-2xl font-semibold text-gray-900">
                      {stat.value}
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
            Recent CVs
          </h3>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <RefreshCw className="h-6 w-6 text-gray-400 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            ) : files.slice(0, 5).map((file) => (
              <div key={file.uuid} className="flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-sm font-medium text-gray-900">
                    {file.original_filename}
                  </span>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  file.status === 'processed'
                    ? 'bg-green-100 text-green-800'
                    : file.status === 'processing'
                    ? 'bg-yellow-100 text-yellow-800'
                    : file.status === 'error'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {file.status}
                </span>
              </div>
            ))}
            {!loading && files.length === 0 && (
              <p className="text-sm text-gray-500">No CVs processed yet</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => navigate(ROUTES.CHAT)}
              className="w-full btn-primary text-left"
            >
              Start AI Chat
            </button>
            <button 
              onClick={() => navigate(ROUTES.UPLOAD)}
              className="w-full btn-secondary text-left"
            >
              Upload New CV
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
