const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(
  path: string,
  options: RequestInit & { token: string }
): Promise<T> {
  const { token, ...rest } = options
  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...rest.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: { message?: string; details?: unknown } }
    throw new ApiError(
      res.status,
      err.error?.message ?? 'Request failed',
      err.error?.details
    )
  }
  return res.json() as Promise<T>
}

export const api = {
  get: <T>(path: string, token: string) =>
    apiRequest<T>(path, { method: 'GET', token }),
  post: <T>(path: string, body: unknown, token: string) =>
    apiRequest<T>(path, { method: 'POST', body: JSON.stringify(body), token }),
  patch: <T>(path: string, body: unknown, token: string) =>
    apiRequest<T>(path, { method: 'PATCH', body: JSON.stringify(body), token }),
  delete: <T>(path: string, token: string) =>
    apiRequest<T>(path, { method: 'DELETE', token }),
}

export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '' && v !== null) sp.set(k, String(v))
  }
  return sp.toString()
}
