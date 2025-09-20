import React, { useState, useRef, useEffect } from 'react'
import { useCVScreener } from '../contexts/CVScreenerContext'
import { Send, Bot, User, FileText, AlertCircle } from 'lucide-react'
import { cvScreenerAPI } from '../services/api'
import { ChatResponse } from '../types'

export default function ChatInterface() {
  const { state, dispatch } = useCVScreener()
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [state.chatMessages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      role: 'user' as const,
      timestamp: new Date(),
    }

    dispatch({ type: 'ADD_CHAT_MESSAGE', payload: userMessage })
    const currentMessage = inputMessage
    setInputMessage('')
    setIsTyping(true)
    setError(null)

    try {
      // Llamar a la API real
      const response: ChatResponse = await cvScreenerAPI.sendChatMessage(currentMessage)
      
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: response.response,
        role: 'assistant' as const,
        timestamp: new Date(),
        sources: response.sources,
        sourceFiles: response.source_files,
        confidence: response.confidence,
      }
      
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: aiMessage })
    } catch (err) {
      console.error('Error en chat:', err)
      setError(err instanceof Error ? err.message : 'Error al procesar la consulta')
      
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Lo siento, hubo un error al procesar tu consulta. Por favor, intenta de nuevo.',
        role: 'assistant' as const,
        timestamp: new Date(),
        isError: true,
      }
      
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: errorMessage })
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Chat con IA</h1>
        <p className="mt-2 text-gray-600">
          Haz preguntas sobre los CVs procesados y obtén insights inteligentes
        </p>
      </div>

      <div className="card h-[600px] flex flex-col">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {state.chatMessages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <Bot className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>¡Hola! Soy tu asistente de IA para análisis de CVs.</p>
              <p className="mt-2">Puedes preguntarme sobre:</p>
              <ul className="mt-2 text-sm space-y-1">
                <li>• Análisis de coincidencias entre CVs y descripciones de trabajo</li>
                <li>• Recomendaciones para mejorar CVs</li>
                <li>• Comparaciones entre candidatos</li>
                <li>• Insights sobre tendencias en los CVs</li>
              </ul>
            </div>
          ) : (
            state.chatMessages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex max-w-xs lg:max-w-md ${
                    message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  <div
                    className={`flex-shrink-0 ${
                      message.role === 'user' ? 'ml-3' : 'mr-3'
                    }`}
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-primary-600'
                          : 'bg-gray-200'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4 text-white" />
                      ) : (
                        <Bot className="h-4 w-4 text-gray-600" />
                      )}
                    </div>
                  </div>
                  <div
                    className={`px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : message.isError
                        ? 'bg-red-100 text-red-900 border border-red-200'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    
                    {/* Mostrar fuentes y confianza para respuestas de IA */}
                    {message.role === 'assistant' && !message.isError && (
                      <div className="mt-2 flex items-center text-xs text-gray-500 gap-3 flex-wrap">
                        {message.confidence && (
                          <div className="flex items-center gap-2">
                            <span>Confianza:</span>
                            <div className="w-16 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-green-500 h-1.5 rounded-full" 
                                style={{ width: `${message.confidence * 100}%` }}
                              ></div>
                            </div>
                            <span>{Math.round(message.confidence * 100)}%</span>
                          </div>
                        )}
                        
                        {message.sourceFiles && message.sourceFiles.length > 0 && (
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            <div className="flex gap-1">
                              {message.sourceFiles.map((file, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-200 rounded text-xs"
                                >
                                  {file}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    <p
                      className={`text-xs mt-1 ${
                        message.role === 'user'
                          ? 'text-primary-100'
                          : message.isError
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="flex max-w-xs lg:max-w-md">
                <div className="flex-shrink-0 mr-3">
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-gray-600" />
                  </div>
                </div>
                <div className="px-4 py-2 rounded-lg bg-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-4">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje aquí..."
              className="flex-1 input-field"
              disabled={isTyping}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isTyping}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
