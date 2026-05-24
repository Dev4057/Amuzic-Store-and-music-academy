/**
 * Phase 1 verification script.
 * Run: npx tsx scripts/verify-phase1.ts
 *
 * Requires a running API (pnpm dev:api) and a valid .env in packages/api.
 * Provide TEST_EMAIL and TEST_PASSWORD env vars for a real Supabase user.
 */

import 'dotenv/config'

const API = process.env['API_URL'] ?? 'http://localhost:4000'
const EMAIL = process.env['TEST_EMAIL'] ?? ''
const PASSWORD = process.env['TEST_PASSWORD'] ?? ''

let passed = 0
let failed = 0

async function check(label: string, fn: () => Promise<void>) {
  try {
    await fn()
    console.log(`  PASS  ${label}`)
    passed++
  } catch (err) {
    console.log(`  FAIL  ${label}: ${String(err)}`)
    failed++
  }
}

function assert(condition: boolean, message: string) {
  if (!condition) throw new Error(message)
}

async function json(res: Response): Promise<unknown> {
  const text = await res.text()
  try {
    return JSON.parse(text) as unknown
  } catch {
    throw new Error(`Non-JSON response (${res.status}): ${text.slice(0, 200)}`)
  }
}

async function main() {
  console.log(`\nAmuzic Academy — Phase 1 Verification\nAPI: ${API}\n`)

  let accessToken = ''

  // 2. POST /api/auth/login returns a session
  await check('POST /api/auth/login returns session for valid user', async () => {
    assert(EMAIL !== '', 'TEST_EMAIL env var required')
    assert(PASSWORD !== '', 'TEST_PASSWORD env var required')
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    })
    const body = await json(res) as Record<string, unknown>
    assert(res.ok, `Expected 200, got ${res.status}: ${JSON.stringify(body)}`)
    assert(typeof (body['session'] as Record<string, unknown>)?.['access_token'] === 'string', 'Missing access_token')
    accessToken = ((body['session'] as Record<string, unknown>)['access_token']) as string
  })

  // 3. GET /api/auth/me with valid token returns profile with role
  await check('GET /api/auth/me with valid Bearer token returns profile', async () => {
    assert(accessToken !== '', 'Need valid token from login test')
    const res = await fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const body = await json(res) as Record<string, unknown>
    assert(res.ok, `Expected 200, got ${res.status}`)
    const user = body['user'] as Record<string, unknown>
    assert(typeof user?.['role'] === 'string', 'Missing role in user object')
  })

  // 4. GET /api/auth/me with no token returns 401
  await check('GET /api/auth/me with no token returns 401', async () => {
    const res = await fetch(`${API}/api/auth/me`)
    assert(res.status === 401, `Expected 401, got ${res.status}`)
  })

  // 5. GET /api/courses returns 4 seeded courses without auth
  await check('GET /api/courses returns seeded courses (no auth required)', async () => {
    const res = await fetch(`${API}/api/courses`)
    const body = await json(res) as Record<string, unknown>
    assert(res.ok, `Expected 200, got ${res.status}`)
    const data = body['data'] as unknown[]
    assert(Array.isArray(data), 'Expected data array')
    assert(data.length >= 4, `Expected >= 4 courses, got ${data.length}`)
  })

  // 6. POST /api/demos works without auth
  await check('POST /api/demos works without auth', async () => {
    const res = await fetch(`${API}/api/demos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: 'Test User',
        phone: '9876543210',
        course_interest: 'guitar',
        student_type: 'adult',
      }),
    })
    assert(
      res.status === 201 || res.status === 200 || res.status === 429,
      `Expected 201/200/429, got ${res.status}`
    )
  })

  // 7. POST /api/demos from same IP 6 times in 15 min returns 429
  await check('POST /api/demos rate-limits at 6 requests (429)', async () => {
    const payload = JSON.stringify({
      full_name: 'Rate Test',
      phone: '9876543211',
      course_interest: 'drums',
      student_type: 'adult',
    })
    let got429 = false
    for (let i = 0; i < 7; i++) {
      const res = await fetch(`${API}/api/demos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      })
      if (res.status === 429) {
        got429 = true
        break
      }
    }
    assert(got429, 'Expected 429 after 6 requests but never received it')
  })

  // 8. GET /api/students with no auth returns 401
  await check('GET /api/students with no auth returns 401', async () => {
    const res = await fetch(`${API}/api/students`)
    assert(res.status === 401, `Expected 401, got ${res.status}`)
  })

  console.log(`\nResults: ${passed} passed, ${failed} failed\n`)
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
