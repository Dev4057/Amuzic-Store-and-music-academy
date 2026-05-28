import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const headerSecret = req.headers.get('x-revalidate-secret')
  const querySecret = req.nextUrl.searchParams.get('secret')
  const secret = headerSecret ?? querySecret

  if (secret !== process.env['REVALIDATE_SECRET']) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as { paths?: string[]; path?: string }
  const paths = body.paths ?? (body.path ? [body.path] : ['/'])

  // Always revalidate common paths when triggered
  const allPaths = new Set([...paths, '/showcase', '/insights', '/courses', '/'])

  for (const p of allPaths) {
    revalidatePath(p)
  }
  revalidatePath('/insights/[slug]', 'page')

  return NextResponse.json({ revalidated: true, paths: [...allPaths] })
}
