'use client'
import { useEffect, useState } from 'react'

export function useCsrfToken() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/parishioner/csrf')
      .then(res => res.json())
      .then(data => setToken(data.token))
      .catch(() => setToken(null))
  }, [])

  return token
}

export function CsrfInput() {
  const token = useCsrfToken()
  return <input type="hidden" name="_csrf" value={token || ''} />
}
