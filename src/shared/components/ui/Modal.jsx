import React from 'react'

export default function Modal({ open, onClose, title, children, footer, hideHeader = false, cardClassName = '', bodyClassName = '' }){
  if(!open) return null
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className={`modal-card ${cardClassName}`.trim()}>
        {!hideHeader && (
          <div className="modal-header">
            {title ? <h3 className="modal-title">{title}</h3> : <div />}
            <button className="icon-btn" onClick={onClose} aria-label="Cerrar">✕</button>
          </div>
        )}
        <div className={`modal-body ${bodyClassName}`.trim()}>{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}
