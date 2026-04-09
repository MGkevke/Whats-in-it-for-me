import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, MessageSquare } from 'lucide-react'

interface ChatMessage {
  id: string
  role: string
  content: string
  created_at: string
}

interface ChatRefineProps {
  lessonId: string
  onUpdate: (lesson: any) => void
}

export default function ChatRefine({ lessonId, onUpdate }: ChatRefineProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Load existing chat messages from the lesson
    fetch(`/api/lessons/${lessonId}`)
      .then(r => r.ok ? r.json() : null)
      .then(lesson => {
        // Chat messages are loaded from the chat endpoint
      })
      .catch(() => {})
  }, [lessonId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const message = input.trim()
    setInput('')
    setSending(true)

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: message,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, tempUserMsg])

    try {
      const res = await fetch(`/api/lessons/${lessonId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      })

      if (!res.ok) throw new Error('Chat mislukt')

      const data = await res.json()
      setMessages(data.messages || [])
      if (data.lesson) onUpdate(data.lesson)
    } catch {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id))
      setInput(message) // restore input
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-cheetah-100/60 shadow-sm shadow-cheetah-500/5 flex flex-col h-[500px] lg:h-[600px]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-cheetah-100/40 flex items-center gap-2 bg-gradient-to-r from-cheetah-50/50 to-primary-50/50">
        <MessageSquare className="w-4 h-4 text-cheetah-600" />
        <h3 className="text-sm font-semibold text-earth-900">Bijsturen met AI</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="text-center text-earth-400 text-sm py-8">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 text-earth-200" />
            <p>Geef feedback om de samenvatting<br />of kaartjes aan te passen</p>
            <p className="text-xs mt-2 text-earth-300">bijv. "Maak de samenvatting korter"</p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-primary-500 to-cheetah-500 text-white rounded-br-md'
                  : 'bg-cheetah-50 text-earth-700 rounded-bl-md'
              }`}>
                {msg.role === 'assistant'
                  ? 'Aanpassingen zijn doorgevoerd!'
                  : msg.content}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {sending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
            <div className="bg-cheetah-50 px-4 py-3 rounded-2xl rounded-bl-md">
              <Loader2 className="w-4 h-4 text-cheetah-500 animate-spin" />
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-cheetah-100/40">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="bijv. Voeg een kaartje toe over..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-cheetah-200/60 text-sm focus:border-cheetah-400 focus:ring-2 focus:ring-cheetah-100 focus:outline-none transition-all"
            disabled={sending}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="p-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-cheetah-500 text-white hover:from-primary-600 hover:to-cheetah-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
