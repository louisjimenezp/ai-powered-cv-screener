import React, { useState, useRef, useEffect } from 'react'
import { useCVScreener } from '../contexts/CVScreenerContext'
import { Send, Bot, User } from 'lucide-react'

export default function ChatInterface() {
  const { state, dispatch } = useCVScreener()
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
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
    setInputMessage('')
    setIsTyping(true)

    // Simular respuesta de la IA
    setTimeout(() => {
      const aiMessage = {
        id: (Date.now() + 1).toString(),
        content: `He analizado tu consulta: "${inputMessage}". Basándome en los CVs procesados, puedo ayudarte con análisis de coincidencias, recomendaciones de mejora, y comparaciones entre candidatos. ¿En qué más puedo ayudarte?`,
        role: 'assistant' as const,
        timestamp: new Date(),
      }
      
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: aiMessage })
      setIsTyping(false)
    }, 1500)
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
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === 'user'
                          ? 'text-primary-100'
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
