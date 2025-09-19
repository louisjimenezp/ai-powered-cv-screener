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
  filename: string
  path: string
}

export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export interface CVFile {
  id: string
  filename: string
  uploadDate: Date
  status: 'uploaded' | 'processing' | 'processed' | 'error'
  analysis?: CVScreeningResponse
}

export interface JobDescription {
  id: string
  title: string
  description: string
  requirements: string[]
  createdAt: Date
}
