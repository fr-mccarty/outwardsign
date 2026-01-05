'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/content-card'
import { Send } from 'lucide-react'
import { staffChatWithAI } from './actions'
import type { ChatMessage } from './actions'

interface ChatViewProps {
  userId: string
  parishId: string
}

export function ChatView({ userId }: ChatViewProps) {
  const initialMessage: ChatMessage = {
    role: 'assistant',
    content: "Hi! I'm your parish management assistant. I can help you with people, families, groups, Masses, events, Mass intentions, availability, content library, and more. What would you like to do?",
    timestamp: new Date().toISOString(),
  }

  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
      const result = await staffChatWithAI(userId, inputMessage, conversationId)

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
        content: "I'm having trouble connecting. Please try again.",
        timestamp: new Date().toISOString(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const quickActions = [
    { label: "Today's Calendar", message: "What's on the calendar for today?" },
    { label: 'Upcoming Masses', message: 'Show me the upcoming Masses' },
    { label: 'Find Person', message: 'Search for a person in the directory' },
    { label: 'List Groups', message: 'Show me all the ministry groups' },
    { label: 'Mass Intentions', message: 'Show me unfulfilled Mass intentions' },
    { label: 'Content Library', message: 'Search the content library for readings' },
    { label: 'Documentation', message: 'Search the documentation for help' },
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
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
              <p className="text-muted-foreground">Thinking...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </Card>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          ref={inputRef}
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          autoFocus
        />
        <Button onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
