import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, Send, X, Minimize2, Camera, FileText } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { ChatMessage } from '../types/database'
import { Plant, Fertilization, SoilHealth, PestControl } from '../types/Plant'

interface ChatBotProps {
  userId: string
  onAddPlant: (plantData: Omit<Plant, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  onUpdatePlant: (plantId: string, updates: Partial<Omit<Plant, 'id' | 'user_id' | 'created_at' | 'updated_at'>>) => Promise<void>
  onDeletePlant: (plantId: string) => Promise<void>
  onAddFertilization: (recordData: Omit<Fertilization, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  onAddSoil: (recordData: Omit<SoilHealth, 'id' | 'user_id' | 'created_at'>) => Promise<void>
  onAddPestControl: (recordData: Omit<PestControl, 'id' | 'user_id' | 'created_at'>) => Promise<void>
}

export const ChatBot: React.FC<ChatBotProps> = ({ 
  userId, 
  onAddPlant, 
  onUpdatePlant, 
  onDeletePlant, 
  onAddFertilization, 
  onAddSoil, 
  onAddPestControl 
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

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

  const handleImageUpload = async (file: File) => {
    if (!file) return

    // Convert image to base64 for OpenAI
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64Image = e.target?.result as string
      const imageData = base64Image.split(',')[1] // Remove data:image/jpeg;base64, prefix

      // Add image message to chat
      const imageMessage: Omit<ChatMessage, 'id' | 'created_at'> = {
        user_id: userId,
        role: 'user',
        content: `[Image uploaded: ${file.name}]`,
        attachments: [{ type: 'image', data: imageData, filename: file.name }],
        timestamp: new Date().toISOString()
      }

      setMessages(prev => [...prev, { ...imageMessage, id: Date.now().toString() }])
      setInputMessage('')
      setIsLoading(true)

      try {
        // Save image message to database
        await supabase.from('chat_messages').insert([imageMessage])

        // Call edge function with image
        const response = await supabase.functions.invoke('openai-chat', {
          body: { 
            messages: [
              ...messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                ...(msg.attachments && { attachments: msg.attachments })
              })),
              {
                role: 'user',
                content: `Please analyze this plant image and help me identify any issues or provide care advice.`,
                attachments: [{ type: 'image', data: imageData, filename: file.name }]
              }
            ],
            userId: userId
          }
        })

        if (response.error) {
          console.error('Edge function error:', response.error)
          throw new Error('Failed to get AI response')
        }

        const assistantRawContent = response.data.choices?.[0]?.message?.content || 'Sorry, I encountered an error analyzing the image.'
        let aiMessageContent = assistantRawContent

        try {
          const parsedResponse = JSON.parse(assistantRawContent)
          if (parsedResponse.type === 'action') {
            aiMessageContent = parsedResponse.message
            // Handle any actions from image analysis
          } else if (parsedResponse.type === 'chat') {
            aiMessageContent = parsedResponse.message
          }
        } catch (e) {
          console.log('AI response was not structured JSON, treating as plain text.')
        }

        const assistantMessage: Omit<ChatMessage, 'id' | 'created_at'> = {
          user_id: userId,
          role: 'assistant',
          content: aiMessageContent,
          timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, { ...assistantMessage, id: Date.now().toString() + '_ai' }])
        await supabase.from('chat_messages').insert([assistantMessage])

      } catch (error) {
        console.error('Error processing image:', error)
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '_error',
          user_id: userId,
          role: 'assistant',
          content: 'Sorry, I encountered an error analyzing the image. Please try again.',
          timestamp: new Date().toISOString()
        }])
      } finally {
        setIsLoading(false)
      }
    }
    reader.readAsDataURL(file)
  }

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Check file type
    const validTypes = ['.csv', '.xlsx', '.xls']
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
    
    if (!validTypes.includes(fileExtension)) {
      alert('Please upload a CSV or Excel file (.csv, .xlsx, .xls)')
      return
    }

    // Add file message to chat
    const fileMessage: Omit<ChatMessage, 'id' | 'created_at'> = {
      user_id: userId,
      role: 'user',
      content: `[File uploaded: ${file.name}]`,
      attachments: [{ type: 'file', filename: file.name }],
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, { ...fileMessage, id: Date.now().toString() }])
    setInputMessage('')
    setIsLoading(true)

    // Read file content
    const reader = new FileReader()
    reader.onload = async (e) => {
      const fileContent = e.target?.result as string

      try {
        // Call edge function with file data
        const response = await supabase.functions.invoke('openai-chat', {
          body: { 
            messages: [
              ...messages.map(msg => ({
                role: msg.role,
                content: msg.content,
                ...(msg.attachments && { attachments: msg.attachments })
              })),
              {
                role: 'user',
                content: `Please analyze this plant data file and help me import or update my plant records. File: ${file.name}`,
                attachments: [{ type: 'file', data: fileContent, filename: file.name }]
              }
            ],
            userId: userId
          }
        })

        if (response.error) {
          console.error('Edge function error:', response.error)
          throw new Error('Failed to get AI response')
        }

        const assistantRawContent = response.data.choices?.[0]?.message?.content || 'Sorry, I encountered an error processing the file.'
        let aiMessageContent = assistantRawContent

        try {
          const parsedResponse = JSON.parse(assistantRawContent)
          if (parsedResponse.type === 'action') {
            aiMessageContent = parsedResponse.message
            // Handle bulk import actions
            if (parsedResponse.action === 'bulkImport') {
              // Handle bulk import of plants
              for (const plantData of parsedResponse.data.plants) {
                await onAddPlant(plantData)
              }
            }
          } else if (parsedResponse.type === 'chat') {
            aiMessageContent = parsedResponse.message
          }
        } catch (e) {
          console.log('AI response was not structured JSON, treating as plain text.')
        }

        const assistantMessage: Omit<ChatMessage, 'id' | 'created_at'> = {
          user_id: userId,
          role: 'assistant',
          content: aiMessageContent,
          timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, { ...assistantMessage, id: Date.now().toString() + '_ai' }])
        await supabase.from('chat_messages').insert([assistantMessage])

      } catch (error) {
        console.error('Error processing file:', error)
        setMessages(prev => [...prev, {
          id: Date.now().toString() + '_error',
          user_id: userId,
          role: 'assistant',
          content: 'Sorry, I encountered an error processing the file. Please try again.',
          timestamp: new Date().toISOString()
        }])
      } finally {
        setIsLoading(false)
      }
    }

    reader.readAsText(file)
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
              content: msg.content,
              ...(msg.attachments && { attachments: msg.attachments })
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

      const assistantRawContent = response.data.choices?.[0]?.message?.content || 'Sorry, I encountered an error generating a response.'
      let aiMessageContent = assistantRawContent

      try {
        const parsedResponse = JSON.parse(assistantRawContent)
        if (parsedResponse.type === 'action') {
          aiMessageContent = parsedResponse.message
          switch (parsedResponse.action) {
            case 'addPlant':
              await onAddPlant(parsedResponse.data)
              break
            case 'updatePlant':
              await onUpdatePlant(parsedResponse.data.id, parsedResponse.data.updates)
              break
            case 'delete_plant':
              await onDeletePlant(parsedResponse.data.id)
              break
            case 'addFertilization':
              await onAddFertilization(parsedResponse.data)
              break
            case 'addSoil':
              await onAddSoil(parsedResponse.data)
              break
            case 'addPestControl':
              await onAddPestControl(parsedResponse.data)
              break
            case 'getPlants':
            case 'getPlantById':
            case 'waterPlant':
            case 'fertilizePlant':
            case 'repotPlant':
            case 'getFertilizationHistory':
            case 'getSoilHistory':
            case 'getPestControlHistory':
              // These actions don't require frontend updates, just display the message
              break
            default:
              console.warn('Unknown action type from AI:', parsedResponse.action)
          }
        } else if (parsedResponse.type === 'chat') {
          aiMessageContent = parsedResponse.message
        }
      } catch (e) {
        // If parsing fails, it's not a structured JSON response, treat as plain chat message
        console.log('AI response was not structured JSON, treating as plain text.')
      }

      const assistantMessage: Omit<ChatMessage, 'id' | 'created_at'> = {
        user_id: userId,
        role: 'assistant',
        content: aiMessageContent,
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
        content: 'Sorry, I encountered an error connecting to the AI assistant or processing its response. Please try again.',
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

  const triggerImageUpload = () => {
    imageInputRef.current?.click()
  }

  const triggerFileUpload = () => {
    fileInputRef.current?.click()
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
                <p className="text-xs mt-2 text-gray-400">
                  I can help you:
                </p>
                <ul className="text-xs mt-1 text-gray-400 space-y-1">
                  <li>• Add, update, or delete plants</li>
                  <li>• Water, fertilize, or repot plants</li>
                  <li>• Track fertilization, soil health, and pest control</li>
                  <li>• 📸 Analyze plant photos for issues</li>
                  <li>• 📄 Import plant data from files</li>
                  <li>• Get plant care advice</li>
                </ul>
                <div className="mt-4 text-xs text-gray-400">
                  <p className="font-medium mb-2">Try asking:</p>
                  <div className="space-y-1 text-left">
                    <p>• "Add a new Monstera plant"</p>
                    <p>• "Water my snake plant"</p>
                    <p>• "Show me all my plants"</p>
                    <p>• "Update my orchid's care instructions"</p>
                    <p>• "Add a fertilization record for my pothos"</p>
                  </div>
                </div>
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
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-2 text-xs opacity-75">
                          📎 {message.attachments[0].filename}
                        </div>
                      )}
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
            <div className="flex gap-2 items-end">
              {/* Upload Icons */}
              <div className="flex gap-1">
                <button
                  onClick={triggerImageUpload}
                  className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Upload image"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <button
                  onClick={triggerFileUpload}
                  className="p-2 text-gray-500 hover:text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                  title="Upload file"
                >
                  <FileText className="w-4 h-4" />
                </button>
              </div>
              
              {/* Text Input */}
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about plant care..."
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                disabled={isLoading}
              />
              
              {/* Send Button */}
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleImageUpload(file)
              e.target.value = '' // Reset input
            }}
            className="hidden"
          />
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
              e.target.value = '' // Reset input
            }}
            className="hidden"
          />
        </>
      )}
    </div>
  )
}