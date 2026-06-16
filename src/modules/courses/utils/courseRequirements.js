export function getCourseRequirements(tag){
  const normalized = String(tag || '').toLowerCase()
  const isVirtual = normalized === 'virtual'

  const base = [
    { key: 'bachiller', label: 'Título de bachiller', note: isVirtual ? 'Digital' : 'Fotocopia' },
    { key: 'cedula', label: 'Cédula de identidad', note: isVirtual ? 'Digital' : 'Fotocopia' },
    { key: 'foto', label: 'Foto tipo carnet', note: isVirtual ? 'Digital' : 'Fotocopia' },
  ]

  return {
    title: 'Requisitos para inscribirse',
    items: base,
  }
}
