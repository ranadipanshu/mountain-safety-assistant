import React, { useState } from 'react'
import { askAgent } from '../api'

function Chat({ selectedRoute }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: 'Namaste! 🏔️ Koi bhi mountain route ke baare mein poochein — main safety analysis karunga.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await askAgent(input, selectedRoute)
      setMessages((prev) => [...prev, { role: 'assistant', text: res.data.reply }])
    } catch (err) {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        text: 'Sorry, abhi AI service available nahi hai. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend()
  }

  return (
    <div className="flex flex-col h-64">

      <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-3 pr-1">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-3 py-2 rounded-xl text-sm max-w-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gray-800 text-gray-400 px-3 py-2 rounded-xl text-sm">
              Analyzing... ⏳
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Route poochein..."
          className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-cyan-500"
        />
        <button
          onClick={handleSend}
          className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Send
        </button>
      </div>

    </div>
  )
}

export default Chat