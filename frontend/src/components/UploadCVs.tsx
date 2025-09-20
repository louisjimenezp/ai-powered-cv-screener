import React, { useState, useRef, useEffect } from 'react'
import { useApi } from '../hooks/useApi'
import { cvScreenerAPI } from '../services/api'
import { Upload, FileText, CheckCircle, Trash2, RefreshCw, AlertCircle } from 'lucide-react'
import { FileMetadata } from '../types'

export default function UploadCVs() {
  const { execute: uploadCV, error } = useApi()
  const [dragActive, setDragActive] = useState(false)
  const [files, setFiles] = useState<FileMetadata[]>([])
  const [loadingFiles, setLoadingFiles] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar lista de archivos al montar el componente
  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      setLoadingFiles(true)
      const response = await cvScreenerAPI.listCVs()
      setFiles(response.files)
    } catch (err) {
      console.error('Error al cargar archivos:', err)
    } finally {
      setLoadingFiles(false)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFile = async (file: File) => {
    if (!file.type.includes('pdf')) {
      alert('Solo se permiten archivos PDF')
      return
    }

    try {
      await uploadCV(() => cvScreenerAPI.uploadCV(file))
      
      // Recargar lista de archivos para mostrar el nuevo archivo
      await loadFiles()
      
    } catch (err) {
      console.error('Error al subir archivo:', err)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const deleteFile = async (uuid: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este archivo? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await cvScreenerAPI.deleteCV(uuid)
      await loadFiles() // Recargar lista
    } catch (err) {
      console.error('Error al eliminar archivo:', err)
      alert('Error al eliminar el archivo. Por favor, intenta de nuevo.')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'processed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'processing':
        return <RefreshCw className="h-5 w-5 text-yellow-500 animate-spin" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <FileText className="h-5 w-5 text-gray-400" />
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Subir CVs</h1>
        <p className="mt-2 text-gray-600">
          Sube archivos PDF de CVs para su análisis con IA
        </p>
      </div>

      {/* Upload Area */}
      <div className="card">
        <div
          className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-colors duration-200 ${
            dragActive
              ? 'border-primary-400 bg-primary-50'
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileInput}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <p className="text-lg font-medium text-gray-900">
              Arrastra y suelta tu archivo PDF aquí
            </p>
            <p className="mt-1 text-sm text-gray-500">
              o haz clic para seleccionar un archivo
            </p>
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-primary"
            >
              Seleccionar Archivo
            </button>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* File List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            Archivos Procesados ({files.length})
          </h3>
          <button
            onClick={loadFiles}
            disabled={loadingFiles}
            className="btn-secondary text-sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loadingFiles ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
        
        {loadingFiles ? (
          <div className="text-center py-8">
            <RefreshCw className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-500">Cargando archivos...</p>
          </div>
        ) : files.length === 0 ? (
          <p className="text-sm text-gray-500">No hay archivos procesados aún</p>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.uuid}
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getStatusIcon(file.status)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.original_filename}
                        </p>
                        <span className="text-xs text-gray-500 font-mono">
                          {file.uuid.substring(0, 8)}...
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
                        <div>
                          <span className="font-medium">Tamaño:</span>
                          <br />
                          {formatFileSize(file.file_size)}
                        </div>
                        <div>
                          <span className="font-medium">Subido:</span>
                          <br />
                          {new Date(file.upload_date).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Chunks:</span>
                          <br />
                          {file.chunks_count || 0}
                        </div>
                        <div>
                          <span className="font-medium">Vectores:</span>
                          <br />
                          {file.vector_stats?.vector_count || 0}
                        </div>
                      </div>

                      {file.processing_errors && file.processing_errors.length > 0 && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                          <strong>Errores:</strong> {file.processing_errors.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
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
                    <button
                      onClick={() => deleteFile(file.uuid)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      title="Eliminar archivo"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
