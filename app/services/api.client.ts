export type ApiError = {
  status: number
  message: string
  data?: any
}

function normalizeError(status: number, data: any): ApiError {
  // El ValidationPipe global de Nest devuelve `message` como un arreglo de
  // strings cuando hay uno o más errores de validación (en vez de un solo
  // string). Sin este join, ese arreglo se pasaba tal cual a toast.error(),
  // que al no recibir un string no muestra ningún texto (toast rojo vacío).
  const rawMessage = data?.message ?? data?.error
  const message = Array.isArray(rawMessage)
    ? rawMessage.join(' ')
    : rawMessage || `Error ${status}`

  return { status, message, data }
}

export async function apiFetch<T>(
  path: string,
  opts: Omit<RequestInit, 'body'> & {
    auth?: boolean
    body?: BodyInit | Record<string, unknown> | null
  } = {}
): Promise<T> {
  const config = useRuntimeConfig()
  const base = String(config.public.apiBase || '').replace(/\/$/, '')

  const headers = new Headers(opts.headers || {})

  // Detecta FormData (para uploads) y NO fuerces JSON en ese caso
  const isFormData =
    typeof FormData !== 'undefined' && opts.body instanceof FormData

  // Body seguro (si viene objeto, lo convertimos a JSON)
  let body = opts.body as BodyInit | null | undefined
  if (!isFormData) {
    if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json')

    // Si body es objeto, lo convertimos a JSON string
    if (body !== undefined && body !== null && typeof body === 'object') {
      body = JSON.stringify(body)
    }
  } else {
    // Si es FormData, NO pongas Content-Type manual (el browser pone boundary)
    if (headers.has('Content-Type')) headers.delete('Content-Type')
  }

  // token (si aplica)
  if (opts.auth !== false) {
    const token = useCookie<string | null>('access_token').value
    if (token) headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(`${base}${path}`, { ...opts, body, headers })

  const ct = res.headers.get('content-type') || ''
  const isJson = ct.includes('application/json')
  const data = isJson
    ? await res.json().catch(() => null)
    : await res.text().catch(() => null)

  if (!res.ok) throw normalizeError(res.status, data)

  return data as T
}