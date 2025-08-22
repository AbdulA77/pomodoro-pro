import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect all routes under /app
  if (pathname.startsWith('/dashboard') || 
      pathname.startsWith('/focus') || 
      pathname.startsWith('/tasks') || 
      pathname.startsWith('/stats') || 
      pathname.startsWith('/settings')) {
    
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    if (!token) {
      const url = new URL('/account/signin', request.url)
      url.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/focus/:path*', 
    '/tasks/:path*',
    '/stats/:path*',
    '/settings/:path*',
  ]
}
