import React from 'react'
import { IoNewspaperOutline } from 'react-icons/io5'

export default function NewsCard({title, meta}){
  return (
    <article className="news-card">
      <div className="news-thumb" aria-hidden><IoNewspaperOutline /></div>
      <div className="news-body">
        <h4 className="news-title">{title}</h4>
        <div className="news-meta">{meta}</div>
      </div>
      <div className="news-tag">Virtual</div>
    </article>
  )
}
