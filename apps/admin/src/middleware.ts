import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isAuthPage = pathname === '/login'
  const hasAuth = request.cookies.has('admin_auth')

  if (!isAuthPage && !hasAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuthPage && hasAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
