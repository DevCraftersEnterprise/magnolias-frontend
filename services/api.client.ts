export type ApiError = {
    status: number
    message: string
    data?: any
  }
  
  function normalizeError(status: number, data: any): ApiError {
    return {
      status,
      message: data?.message || data?.error || `Error ${status}`,
      data,
    }
  }
  
  export async function apiFetch<T>(
    path: string,
    opts: RequestInit & { auth?: boolean } = {}
  ): Promise<T> {
    const config = useRuntimeConfig()
    const base = String(config.public.apiBase || '').replace(/\/$/, '')
  
    const headers = new Headers(opts.headers || {})
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')
  
    // token (si aplica)
    if (opts.auth !== false) {
      const token = useCookie<string | null>('access_token').value
      if (token) headers.set('Authorization', `Bearer ${token}`)
    }
  
    const res = await fetch(`${base}${path}`, { ...opts, headers })
  
    const ct = res.headers.get('content-type') || ''
    const isJson = ct.includes('application/json')
    const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null)
  
    if (!res.ok) throw normalizeError(res.status, data)
  
    return data as T
  }
  