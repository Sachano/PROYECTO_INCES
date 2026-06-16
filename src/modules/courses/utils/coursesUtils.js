export function filterCourses(courses, { q, type }){
  const query = (q || '').trim().toLowerCase()
  return courses.filter(c => {
    const matchesType = type === 'all' || c.tag === type
    const matchesQuery = !query || c.title.toLowerCase().includes(query)
    return matchesType && matchesQuery
  })
}

export function paginate(items, page, pageSize){
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const current = Math.max(1, Math.min(totalPages, page))
  const start = (current - 1) * pageSize
  return {
    totalPages,
    current,
    items: items.slice(start, start + pageSize)
  }
}
