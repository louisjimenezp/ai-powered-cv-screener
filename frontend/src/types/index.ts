// Tipos para el sistema de screening de CVs

export interface CVScreeningRequest {
  job_description: string
  cv_text: string
  screening_criteria?: string[]
}

export interface CVScreeningResponse {
  score: number
  match_percentage: number
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  detailed_analysis: Record<string, number>
}

export interface ScreeningCriteria {
  technical_skills: string[]
  soft_skills: string[]
  experience_levels: string[]
}

export interface UploadResponse {
  message: string
  uuid: string
  filename: string
  status: 'uploaded' | 'processing' | 'processed' | 'error'
  chunks_count?: number
}

export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
  sources?: string[]  // UUIDs de archivos fuente
  sourceFiles?: string[]  // Nombres de archivos fuente
  confidence?: number  // Nivel de confianza de la respuesta
  isError?: boolean  // Si es un mensaje de error
}

export interface CVFile {
  id: string
  filename: string
  uploadDate: Date
  status: 'uploaded' | 'processing' | 'processed' | 'error'
  analysis?: CVScreeningResponse
}

// Nuevos tipos para el sistema UUID
export interface FileMetadata {
  uuid: string
  original_filename: string
  upload_date: string
  file_size: number
  status: 'uploaded' | 'processing' | 'processed' | 'error'
  chunks_count?: number
  processing_errors?: string[]
  vector_stats?: {
    vector_count: number
    chunk_indices: number[]
    filenames: string[]
    status: string
  }
}

export interface ChatResponse {
  response: string
  sources: string[]  // UUIDs de archivos
  source_files: string[]  // Nombres originales
  confidence: number
}

export interface ChatRequest {
  message: string
}

export interface DeleteResponse {
  message: string
  uuid: string
  status: string
}

export interface FileListResponse {
  files: FileMetadata[]
  stats: {
    total_cv_files: number
    total_metadata_files: number
    data_directory: string
  }
  total: number
}

export interface ChatStats {
  vector_count: number
  index_stats: any
  file_stats: any
}

export interface JobDescription {
  id: string
  title: string
  description: string
  requirements: string[]
  createdAt: Date
}
