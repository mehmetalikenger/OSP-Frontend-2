import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('accessToken');
  const path = request.nextUrl.pathname;

  // Protect these routes
  if (path.startsWith('/profile') || path.startsWith('/chiller') || path.startsWith('/admin-panel')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect away from login if already logged in
  if (path === '/login' && token) {
    return NextResponse.redirect(new URL('/chiller', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/profile/:path*', '/chiller/:path*', '/admin-panel/:path*', '/login'],
};
