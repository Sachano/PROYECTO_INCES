import React from 'react'

export default function NewsCard({title, meta}){
  return (
    <article className="news-card">
      <div className="news-thumb">📰</div>
      <div className="news-body">
        <h4 className="news-title">{title}</h4>
        <div className="news-meta">{meta}</div>
      </div>
      <div className="news-tag">Virtual</div>
    </article>
  )
}
