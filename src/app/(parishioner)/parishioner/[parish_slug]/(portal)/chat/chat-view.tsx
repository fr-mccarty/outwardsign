'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/content-card'
import { Send, Mic, MicOff } from 'lucide-react'
import { chatWithAI } from './actions'
import type { ChatMessage } from './actions'
import { useLanguage } from '../language-context'
import { useCsrfToken } from '@/components/csrf-token'

interface ChatViewProps {
  personId: string
  parishId: string
}

export function ChatView({ personId }: ChatViewProps) {
  const { language } = useLanguage()
  const csrfToken = useCsrfToken()

  const initialMessage: ChatMessage = {
    role: 'assistant',
    content:
      language === 'es'
        ? '¡Hola! Soy tu asistente ministerial. Puedo ayudarte con tu horario, marcar fechas de no disponibilidad y responder preguntas sobre tus compromisos. ¿Qué te gustaría saber?'
        : "Hi! I'm your ministry assistant. I can help you with your schedule, mark unavailable dates, and answer questions about your commitments. What would you like to know?",
    timestamp: new Date().toISOString(),
  }

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [voiceSupported, setVoiceSupported] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        setVoiceSupported(true)
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInputMessage(transcript)
          setIsListening(false)
        }

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognitionRef.current = recognition
      }
    }
  }, [])

  const handleVoiceInput = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      recognitionRef.current.start()
      setIsListening(true)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const result = await chatWithAI(personId, inputMessage, conversationId, language, csrfToken || undefined)

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: result.response,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMessage])
      setConversationId(result.conversationId)
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content:
          language === 'es'
            ? 'Tengo problemas para conectarme. Por favor, inténtalo de nuevo.'
            : "I'm having trouble connecting. Please try again.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    }

    setIsLoading(false)
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActions =
    language === 'es'
      ? [
          { label: 'Mi horario', message: 'Muéstrame mi próximo horario' },
          { label: 'Mis lecturas', message: '¿Cuáles son mis lecturas este domingo?' },
          { label: 'Marcar no disponible', message: 'Márcame como no disponible la próxima semana' },
        ]
      : [
          { label: 'My Schedule', message: 'Show me my upcoming schedule' },
          { label: 'My Readings', message: 'What are my readings this Sunday?' },
          { label: 'Mark Unavailable', message: 'Mark me unavailable next week' },
        ]

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">
          {language === 'es' ? 'Chat con asistente IA' : 'Chat with AI Assistant'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {language === 'es'
            ? 'Haz preguntas sobre tu horario y compromisos'
            : 'Ask questions about your schedule and commitments'}
        </p>
      </div>

      {/* Quick Action Pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="outline"
            size="sm"
            onClick={() => setInputMessage(action.message)}
          >
            {action.label}
          </Button>
        ))}
      </div>

      {/* Messages Area */}
      <Card className="flex-1 p-4 overflow-y-auto mb-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.role === 'user'
                    ? 'text-primary-foreground/70'
                    : 'text-muted-foreground'
                }`}
              >
                {new Date(message.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <p className="text-muted-foreground">
                {language === 'es' ? 'Escribiendo...' : 'Typing...'}
              </p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            isListening
              ? language === 'es'
                ? 'Escuchando...'
                : 'Listening...'
              : language === 'es'
                ? 'Escribe tu mensaje...'
                : 'Type your message...'
          }
          disabled={isLoading || isListening}
        />
        {voiceSupported && (
          <Button
            variant={isListening ? 'destructive' : 'outline'}
            onClick={handleVoiceInput}
            disabled={isLoading}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
        )}
        <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
