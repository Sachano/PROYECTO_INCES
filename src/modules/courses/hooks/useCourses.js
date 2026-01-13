import { useEffect, useState } from 'react'
import { api } from '../../../services/api.js'

export function useCourses(){
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    setLoading(true)
    api.courses.list()
      .then(items => { if(alive) setCourses(items) })
      .catch(err => { if(alive) setError(err) })
      .finally(() => { if(alive) setLoading(false) })

    return () => { alive = false }
  }, [])

  return { courses, loading, error }
}
