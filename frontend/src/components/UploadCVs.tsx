import React, { useState, useRef } from 'react'
import { useCVScreener } from '../contexts/CVScreenerContext'
import { useApi } from '../hooks/useApi'
import { cvScreenerAPI } from '../services/api'
import { Upload, FileText, X, CheckCircle } from 'lucide-react'

export default function UploadCVs() {
  const { state, dispatch } = useCVScreener()
  const { execute: uploadCV, loading, error } = useApi()
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      const response = await uploadCV(() => cvScreenerAPI.uploadCV(file))
      
      // Agregar archivo al estado
      const newCVFile = {
        id: Date.now().toString(),
        filename: file.name,
        uploadDate: new Date(),
        status: 'uploaded' as const,
      }
      
      dispatch({ type: 'ADD_CV_FILE', payload: newCVFile })
      
      // Simular procesamiento
      setTimeout(() => {
        dispatch({
          type: 'UPDATE_CV_FILE',
          payload: { id: newCVFile.id, updates: { status: 'processed' } }
        })
      }, 2000)
      
    } catch (err) {
      console.error('Error al subir archivo:', err)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const removeFile = (id: string) => {
    dispatch({ type: 'REMOVE_CV_FILE', payload: id })
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
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Archivos Subidos ({state.cvFiles.length})
        </h3>
        
        {state.cvFiles.length === 0 ? (
          <p className="text-sm text-gray-500">No hay archivos subidos aún</p>
        ) : (
          <div className="space-y-3">
            {state.cvFiles.map((cv) => (
              <div
                key={cv.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {cv.filename}
                    </p>
                    <p className="text-xs text-gray-500">
                      Subido: {cv.uploadDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {cv.status === 'processed' && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    cv.status === 'processed'
                      ? 'bg-green-100 text-green-800'
                      : cv.status === 'processing'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {cv.status}
                  </span>
                  <button
                    onClick={() => removeFile(cv.id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
