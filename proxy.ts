import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const token = request.cookies.get('accessToken');
  const refreshToken = request.cookies.get('refreshToken');
  const path = request.nextUrl.pathname;

  // Root: always redirect — to /products if logged in, otherwise /login
  if (path === '/') {
    if (token || refreshToken) {
      return NextResponse.redirect(new URL('/products', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Protect these routes
  if (path.startsWith('/profile') || path.startsWith('/products') || path.startsWith('/admin-panel')) {
    if (!token && !refreshToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Redirect away from login if already logged in
  if (path === '/login' && token) {
    return NextResponse.redirect(new URL('/products', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/profile/:path*', '/products/:path*', '/admin-panel/:path*', '/login'],
};
