import { type NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isLoginPage = pathname === '/login'
  const isChangePasswordPage = pathname === '/change-password'
  const hasAuth = request.cookies.has('admin_auth')

  if (!isLoginPage && !hasAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isLoginPage && hasAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Logged-in users can always reach /change-password
  if (isChangePasswordPage && !hasAuth) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
