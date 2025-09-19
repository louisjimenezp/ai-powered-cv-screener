import React, { createContext, useContext, useReducer, ReactNode } from 'react'
import { CVFile, JobDescription, ChatMessage } from '../types'

interface CVScreenerState {
  cvFiles: CVFile[]
  jobDescriptions: JobDescription[]
  chatMessages: ChatMessage[]
  isLoading: boolean
  error: string | null
}

type CVScreenerAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_CV_FILE'; payload: CVFile }
  | { type: 'UPDATE_CV_FILE'; payload: { id: string; updates: Partial<CVFile> } }
  | { type: 'REMOVE_CV_FILE'; payload: string }
  | { type: 'ADD_JOB_DESCRIPTION'; payload: JobDescription }
  | { type: 'ADD_CHAT_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_CHAT_MESSAGES' }

const initialState: CVScreenerState = {
  cvFiles: [],
  jobDescriptions: [],
  chatMessages: [],
  isLoading: false,
  error: null,
}

function cvScreenerReducer(state: CVScreenerState, action: CVScreenerAction): CVScreenerState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'ADD_CV_FILE':
      return { ...state, cvFiles: [...state.cvFiles, action.payload] }
    
    case 'UPDATE_CV_FILE':
      return {
        ...state,
        cvFiles: state.cvFiles.map(cv =>
          cv.id === action.payload.id
            ? { ...cv, ...action.payload.updates }
            : cv
        ),
      }
    
    case 'REMOVE_CV_FILE':
      return {
        ...state,
        cvFiles: state.cvFiles.filter(cv => cv.id !== action.payload),
      }
    
    case 'ADD_JOB_DESCRIPTION':
      return { ...state, jobDescriptions: [...state.jobDescriptions, action.payload] }
    
    case 'ADD_CHAT_MESSAGE':
      return { ...state, chatMessages: [...state.chatMessages, action.payload] }
    
    case 'CLEAR_CHAT_MESSAGES':
      return { ...state, chatMessages: [] }
    
    default:
      return state
  }
}

interface CVScreenerContextType {
  state: CVScreenerState
  dispatch: React.Dispatch<CVScreenerAction>
}

const CVScreenerContext = createContext<CVScreenerContextType | undefined>(undefined)

export function CVScreenerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cvScreenerReducer, initialState)

  return (
    <CVScreenerContext.Provider value={{ state, dispatch }}>
      {children}
    </CVScreenerContext.Provider>
  )
}

export function useCVScreener() {
  const context = useContext(CVScreenerContext)
  if (context === undefined) {
    throw new Error('useCVScreener must be used within a CVScreenerProvider')
  }
  return context
}
