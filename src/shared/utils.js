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
