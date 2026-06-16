import React, { useState, useEffect } from 'react'
import { useAuth } from '../../auth/context/AuthContext.jsx'
import api from '../../../services/api'
import '../../../styles/chatbot.css'

export default function ChatbotButton(){
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  const [currentConv, setCurrentConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [height, setHeight] = useState(400)

  useEffect(() => {
    // Load conversations from localStorage
    const saved = localStorage.getItem('chatbot_conversations')
    if(saved){
      setConversations(JSON.parse(saved))
    }
  }, [])

  const startConversation = () => {
    const now = new Date()
    const title = now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
    const newConv = { id: Date.now(), title, messages: [] }
    const updated = [newConv, ...conversations].slice(0, 5) // Keep only 5
    setConversations(updated)
    setCurrentConv(newConv.id)
    setMessages([])
    localStorage.setItem('chatbot_conversations', JSON.stringify(updated))
  }

  const selectConversation = (id) => {
    const conv = conversations.find(c => c.id === id)
    setCurrentConv(id)
    setMessages(conv.messages)
  }

  const sendMessage = async () => {
    if(!newMessage.trim()) return
    const msg = { text: newMessage, from: 'user', time: new Date().toISOString() }
    const updatedMessages = [...messages, msg]
    setMessages(updatedMessages)
    setNewMessage('')

    // Update conversation
    const updatedConv = conversations.map(c => c.id === currentConv ? { ...c, messages: updatedMessages } : c)
    setConversations(updatedConv)
    localStorage.setItem('chatbot_conversations', JSON.stringify(updatedConv))

    // If message contains 'admin' or something, send to admin
    if(newMessage.toLowerCase().includes('admin') || newMessage.toLowerCase().includes('queja') || newMessage.toLowerCase().includes('peticion')){
      try{
        await api.post('/alerts', { subject: 'Mensaje del chatbot', text: newMessage, userId: user.id })
      }catch(err){
        console.error('Error sending to admin', err)
      }
    }
  }

  if(!user) return null

  return (
    <>
      <div className="chatbot-button" onClick={() => setOpen(!open)}>
        🤖
      </div>
      {open && (
        <div className="chatbot-dashboard" style={{ height: `${height}px` }}>
          <div className="chatbot-sidebar">
            <div className="chatbot-header">
              <h3>Asistente INCES</h3>
              <button onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="chatbot-conversations">
              <button onClick={startConversation}>Nueva conversación</button>
              {conversations.map(c => (
                <div key={c.id} onClick={() => selectConversation(c.id)} className={currentConv === c.id ? 'active' : ''}>
                  {c.title}
                </div>
              ))}
            </div>
          </div>
          <div className="chatbot-main">
            <div className="chatbot-messages">
              {messages.map((msg, i) => {
                const prevMsg = messages[i-1]
                const showDateSeparator = !prevMsg || new Date(msg.time).getDate() !== new Date(prevMsg.time).getDate()
                const showTimeSeparator = !prevMsg || (new Date(msg.time) - new Date(prevMsg.time)) > 3 * 60 * 60 * 1000 // 3 hours
                return (
                  <div key={i}>
                    {showDateSeparator && <div className="date-separator">{new Date(msg.time).toLocaleDateString()}</div>}
                    {showTimeSeparator && <hr className="message-separator" />}
                    <div className={`message ${msg.from}`}>
                      {msg.text}
                      <span className="time">{new Date(msg.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="chatbot-footer">
              <input
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                onKeyPress={e => e.key === 'Enter' && sendMessage()}
              />
              <button onClick={sendMessage}>Enviar</button>
            </div>
          </div>
          <div className="resize-handle" onMouseDown={(e) => {
            const startY = e.clientY
            const startHeight = height
            const onMouseMove = (e) => {
              setHeight(startHeight + (startY - e.clientY))
            }
            const onMouseUp = () => {
              document.removeEventListener('mousemove', onMouseMove)
              document.removeEventListener('mouseup', onMouseUp)
            }
            document.addEventListener('mousemove', onMouseMove)
            document.addEventListener('mouseup', onMouseUp)
          }}></div>
        </div>
      )}
    </>
  )
}