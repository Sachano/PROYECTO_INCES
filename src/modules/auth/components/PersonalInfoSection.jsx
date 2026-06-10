import React from 'react'
import { getCharCountDisplay, validateField, VALIDATION_RULES } from '../../../shared/utils'

export default function PersonalInfoSection({ formData, onChange, errors }) {
  const { firstName, lastName, cedulaType, cedula, email, phone, emergencyPhone, charLimitErrors, duplicateErrors } = formData

  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ fontSize: '14px', color: '#1a1a2e', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
        Información Personal
      </h3>

      <div className="input-group">
        <label className="sr-only">Nombres</label>
        <input
          className="input"
          name="firstName"
          value={firstName}
          onChange={onChange}
          placeholder="Nombres *"
          required
        />
      </div>
      {firstName.length > 0 && (
        <div style={{
          fontSize: '11px',
          marginTop: '4px',
          textAlign: 'right',
          color: firstName.length > VALIDATION_RULES.firstName.maxLength ? '#e94560' : '#888'
        }}>
          {firstName.length}/{VALIDATION_RULES.firstName.maxLength} caracteres
        </div>
      )}

      <div className="input-group">
        <label className="sr-only">Apellidos</label>
        <input
          className="input"
          name="lastName"
          value={lastName}
          onChange={onChange}
          placeholder="Apellidos *"
          required
        />
      </div>
      {lastName.length > 0 && (
        <div style={{
          fontSize: '11px',
          marginTop: '4px',
          textAlign: 'right',
          color: lastName.length > VALIDATION_RULES.lastName.maxLength ? '#e94560' : '#888'
        }}>
          {lastName.length}/{VALIDATION_RULES.lastName.maxLength} caracteres
        </div>
      )}

      <div className="input-group" style={{ display: 'flex', gap: '8px' }}>
        <select
          className="input"
          name="cedulaType"
          value={cedulaType}
          onChange={onChange}
          style={{ width: '80px', appearance: 'auto' }}
        >
          {['V', 'E', 'J', 'C', 'G', 'FP'].map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
        <input
          className="input"
          name="cedula"
          value={cedula}
          onChange={onChange}
          placeholder="Cédula (ej: 12345678) *"
          required
          style={{ flex: 1 }}
        />
      </div>
      {duplicateErrors.cedula && (
        <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
          {duplicateErrors.cedula}
        </div>
      )}

      <div className="input-group">
        <label className="sr-only">Correo Electrónico</label>
        <input
          className="input"
          type="email"
          name="email"
          value={email}
          onChange={onChange}
          placeholder="Correo Electrónico *"
          required
        />
      </div>
      {duplicateErrors.email && (
        <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
          {duplicateErrors.email}
        </div>
      )}

      <div className="input-group">
        <label className="sr-only">Teléfono Celular</label>
        <input
          className="input"
          name="phone"
          value={phone}
          onChange={onChange}
          placeholder="Teléfono Celular *"
          required
        />
      </div>
      {duplicateErrors.phone && (
        <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
          {duplicateErrors.phone}
        </div>
      )}

      <div className="input-group">
        <label className="sr-only">Teléfono de Emergencia</label>
        <input
          className="input"
          name="emergencyPhone"
          value={emergencyPhone}
          onChange={onChange}
          placeholder="Teléfono de Emergencia (opcional)"
        />
      </div>
      {duplicateErrors.emergencyPhone && (
        <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
          {duplicateErrors.emergencyPhone}
        </div>
      )}
    </div>
  )
}