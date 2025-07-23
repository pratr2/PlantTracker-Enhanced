import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Minimize2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ChatMessage } from '../types/database'

interface ChatBotProps {
  userId: string
}

export const ChatBot: React.FC<ChatBotProps> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      loadChatHistory()
    }
  }, [isOpen])

  const loadChatHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: true })
        .limit(50)

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Omit<ChatMessage, 'id' | 'created_at'> = {
      user_id: userId,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    }

    // Add user message to UI immediately
    setMessages(prev => [...prev, { ...userMessage, id: Date.now().toString() }])
    setInputMessage('')
    setIsLoading(true)

    try {
      // Save user message to database
      await supabase.from('chat_messages').insert([userMessage])

      // Call edge function for ChatGPT response
      const response = await supabase.functions.invoke('openai-chat', {
        body: { 
          messages: [
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            {
              role: 'user',
              content: inputMessage.trim()
            }
          ],
          userId: userId
        }
      })

      if (response.error) {
        console.error('Edge function error:', response.error)
        throw new Error('Failed to get AI response')
      }

      const assistantMessage: Omit<ChatMessage, 'id' | 'created_at'> = {
        user_id: userId,
        role: 'assistant',
        content: response.data.response || 'Sorry, I encountered an error generating a response.',
        timestamp: new Date().toISOString()
      }

      // Add assistant response to UI
      setMessages(prev => [...prev, { ...assistantMessage, id: Date.now().toString() + '_ai' }])

      // Save assistant message to database
      await supabase.from('chat_messages').insert([assistantMessage])

    } catch (error) {
      console.error('Error sending message:', error)
      // Add error message to UI
      setMessages(prev => [...prev, {
        id: Date.now().toString() + '_error',
        user_id: userId,
        role: 'assistant',
        content: 'Sorry, I encountered an error connecting to the AI assistant. Please try again.',
        timestamp: new Date().toISOString()
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-full shadow-lg transition-all duration-300 hover:scale-110 z-50"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-12' : 'w-80 h-96'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b bg-emerald-500 text-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Plant Assistant</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-emerald-600 rounded"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-emerald-600 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 p-3 h-64 overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Ask me anything about plant care!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 p-2 rounded-lg text-sm">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-3 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about plant care..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}