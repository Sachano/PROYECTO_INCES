import React from 'react'
import { getCharCountDisplay, validateField, VALIDATION_RULES } from '../../../shared/utils'

export default function PasswordConfirmationSection({ password, confirmPassword, onChange, errors, onSubmit, busy }) {
  const showPasswordHint = password.length > 0 && password.length < 8
  const showMismatch = confirmPassword.length > 0 && password !== confirmPassword

  return (
    <>
      <div className="input-group">
        <label className="sr-only">Contraseña</label>
        <input
          className="input"
          type="password"
          name="password"
          value={password}
          onChange={onChange}
          placeholder="Contraseña *"
          required
        />
      </div>
      {password.length > 0 && (
        <div style={{
          fontSize: '11px',
          marginTop: '4px',
          textAlign: 'right',
          color: password.length > VALIDATION_RULES.password.maxLength ? '#e94560' : '#888'
        }}>
          {password.length}/{VALIDATION_RULES.password.maxLength} caracteres
        </div>
      )}
      {showPasswordHint && (
        <div style={{ fontSize: '11px', color: '#e94560', marginTop: '4px' }}>
          La contraseña debe tener al menos 8 caracteres
        </div>
      )}

      <div className="input-group">
        <label className="sr-only">Confirmar Contraseña</label>
        <input
          className="input"
          type="password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={onChange}
          placeholder="Confirmar Contraseña *"
          required
        />
      </div>
      {showMismatch && (
        <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
          Las contraseñas no coinciden
        </div>
      )}

      {errors?.general && (
        <div className="form-error" style={{ marginTop: '12px' }}>
          {errors.general}
        </div>
      )}

      <button
        className="btn primary full"
        type="submit"
        disabled={busy}
        style={{ marginTop: '12px' }}
      >
        {busy ? 'Creando cuenta...' : 'Crear Cuenta'}
      </button>
    </>
  )
}