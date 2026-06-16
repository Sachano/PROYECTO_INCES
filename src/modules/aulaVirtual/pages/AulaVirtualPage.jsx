import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/context/AuthContext.jsx'
import api from '../../../services/api'
import '../../../styles/aulaVirtual.css'

export default function AulaVirtualPage(){
  const { user } = useAuth()
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Load courses based on role
  const [courses, setCourses] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [user])

  useEffect(() => {
    if(courseId){
      // Load course and messages
      setCourse(courses.find(c => c.id == courseId))
      // Load messages
    }
  }, [courseId, courses])

  async function loadCourses() {
    setLoadingCourses(true)
    try {
      if(user?.role === 'master'){
        // Load all active courses
        const res = await api.courses.list({ status: 'active' })
        setCourses(res.map(c => ({ id: c.id, title: c.title, lastMessage: '', lastTime: '' })))
      }else{
        // Load enrolled courses
        const res = await api.virtualClassroom.listCourses()
        setCourses(res.map(c => ({ id: c.id, title: c.title, lastMessage: '', lastTime: '' })))
      }
    } catch(err) {
      console.error(err)
    } finally {
      setLoadingCourses(false)
    }
  }

  const sendMessage = async () => {
    if(!newMessage.trim()) return
    setBusy(true)
    try{
      // API call
      setMessages([...messages, { id: Date.now(), text: newMessage, user: user.firstName, time: new Date().toLocaleTimeString() }])
      setNewMessage('')
    }catch(err){
      console.error(err)
    }finally{
      setBusy(false)
    }
  }

  return (
    <div className="aula-virtual">
      {/* Left Sidebar */}
      <div className={`aula-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="sidebar-toggle">
          {sidebarCollapsed ? '>' : '<'}
        </button>
        <div className="courses-list">
          {courses.map(c => (
            <div key={c.id} className={`course-item ${String(c.id) === courseId ? 'active' : ''}`} onClick={() => navigate(`/aula-virtual/${c.id}`)}>
              {sidebarCollapsed ? (
                <div className="course-img">
                  <img src={c.img || '/default-course.png'} alt={c.title} />
                </div>
              ) : (
                <>
                  <div className="course-title">{c.title}</div>
                  <div className="last-msg">{c.lastMessage}</div>
                  <div className="last-time">{c.lastTime}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat */}
      <div className="aula-main">
        {/* Header */}
        <div className="aula-header">
          <h1>{course?.title || 'Aula Virtual'}</h1>
          <div className="header-actions">
            <button className="btn-icon">📞</button>
            <button className="btn-icon">📹</button>
            <button className="btn-icon">⚙️</button>
          </div>
        </div>

        {/* Messages */}
        <div className="aula-messages">
          {messages.map(msg => (
            <div key={msg.id} className="message">
              <strong>{msg.user}:</strong> {msg.text} <span className="time">{msg.time}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="aula-footer">
          <input
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            placeholder="Escribe un mensaje..."
            onKeyPress={e => e.key === 'Enter' && sendMessage()}
          />
          <button onClick={sendMessage} disabled={busy}>Enviar</button>
        </div>
      </div>
    </div>
  )
}