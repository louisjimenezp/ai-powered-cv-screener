// Types for the CV screening system

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
  sources?: string[]  // Source file UUIDs
  sourceFiles?: string[]  // Source file names
  confidence?: number  // Response confidence level
  isError?: boolean  // If it's an error message
}

export interface CVFile {
  id: string
  filename: string
  uploadDate: Date
  status: 'uploaded' | 'processing' | 'processed' | 'error'
  analysis?: CVScreeningResponse
}

// New types for the UUID system
export interface FileMetadata {
  uuid: string
  original_filename: string
  upload_date: string
  file_size: number
  status: 'uploaded' | 'processing' | 'processed' | 'error'
  chunks_count?: number
  processing_errors?: string[]
}

export interface ChatResponse {
  response: string
  sources: string[]  // File UUIDs
  source_files: string[]  // Original names
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
