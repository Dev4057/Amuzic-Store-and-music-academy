import { revalidatePath } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const path = (body as { path?: string }).path ?? '/'

  revalidatePath(path)

  return NextResponse.json({ revalidated: true, path })
}
