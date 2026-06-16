export function normalizeIdentifier(value){
  return String(value || '').trim().toLowerCase()
}

export function onlyDigits(value){
  return String(value || '').replace(/[^0-9]/g, '')
}

export function isLikelyCedula(value){
  if(!value) return false
  return /^[0-9.\-\s]+$/.test(String(value))
}

export function sanitizeIdentifierInput(value){
  if(!value) return ''
  let v = String(value).trim()
  // if starts with letter or contains @ or dot, treat as email-like
  if(/^[a-zA-Z]/.test(v) || /[@.]/.test(v)){
    v = v.replace(/[^a-zA-Z0-9@.]/g, '')
    const parts = v.split('@')
    if(parts.length > 2) v = parts.slice(0,2).join('@')
    return v
  }
  // otherwise cédula-like: keep digits and dash/dots
  return v.replace(/[^0-9.-]/g, '')
}

export function validateEmailFormat(email){
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(String(email || ''))
}

export function validateCedulaFormat(value){
  const digits = onlyDigits(value)
  return /^\d{6,10}$/.test(digits)
}

// Character limit validation utilities
export function getCharCount(value){
  return String(value || '').length
}

export function validateMaxLength(value, maxLength){
  return String(value || '').length <= maxLength
}

export function getRemainingChars(value, maxLength){
  return maxLength - String(value || '').length
}

export function truncateToMaxLength(value, maxLength){
  const str = String(value || '')
  return str.length > maxLength ? str.substring(0, maxLength) : str
}

// Validation rules for specific fields
export const VALIDATION_RULES = {
  firstName: { maxLength: 50, required: true },
  lastName: { maxLength: 50, required: true },
  cedula: { maxLength: 8, required: true },
  email: { maxLength: 50, required: true },
  phone: { maxLength: 15, required: true },
  emergencyPhone: { maxLength: 15, required: false },
  password: { minLength: 8, maxLength: 32, required: true },
  courseTitle: { maxLength: 20, required: true },
  courseDescription: { maxLength: 100, required: true },
  courseLongDescription: { maxLength: 500, required: false },
  courseHours: { minValue: 0, maxValue: 99999, required: true },
  securityAnswer: { maxLength: 50, required: true },
  userName: { maxLength: 25, required: true },
  userEmail: { maxLength: 50, required: true },
  userPhone: { maxLength: 15, required: true },
  name: { maxLength: 60, required: false },
  bio: { maxLength: 50, required: false },
  grade: { maxLength: 24, required: false }
}

export function validateField(name, value, rules = VALIDATION_RULES) {
  const rule = rules[name]
  if (!rule) return { valid: true, error: '' }
  
  const strValue = String(value || '').trim()
  
  // Required field check
  if (rule.required && (!strValue || strValue.length === 0)) {
    return { valid: false, error: 'Este campo es obligatorio' }
  }
  
  // Skip further validation if empty and not required
  if (!strValue || strValue.length === 0) {
    return { valid: true, error: '' }
  }
  
  // Min length check
  if (rule.minLength && strValue.length < rule.minLength) {
    return { valid: false, error: `Mínimo ${rule.minLength} caracteres` }
  }
  
  // Max length check
  if (rule.maxLength && strValue.length > rule.maxLength) {
    return { valid: false, error: `Máximo ${rule.maxLength} caracteres (actual: ${strValue.length})` }
  }
  
  // Min value check for numbers
  if (rule.minValue !== undefined && Number(strValue) < rule.minValue) {
    return { valid: false, error: `Mínimo ${rule.minValue} ${name.includes('hour') ? 'horas' : ''}` }
  }
  
  // Max value check for numbers
  if (rule.maxValue !== undefined && Number(strValue) > rule.maxValue) {
    return { valid: false, error: `Máximo ${rule.maxValue}` }
  }
  
  return { valid: true, error: '' }
}

export function getCharCountDisplay(value, maxLength) {
  const count = String(value || '').length
  const remaining = maxLength - count
  if (remaining < 0) {
    return { text: `-${Math.abs(remaining)} caracteres`, type: 'error' }
  } else if (remaining <= 10) {
    return { text: `${remaining} restantes`, type: 'warning' }
  } else {
    return { text: '', type: 'normal' }
  }
}
