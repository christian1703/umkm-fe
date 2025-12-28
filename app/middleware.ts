// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Redirect root to login
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Get token from cookies
  const token = request.cookies.get('auth_token')?.value;
  
  const isAuthRoute = pathname.startsWith('/login');
  const isAdminRoute = pathname.startsWith('/admin');
  const isKasirRoute = pathname.startsWith('/kasir');
  const isProtectedRoute = isAdminRoute || isKasirRoute;

  // If accessing login while authenticated, redirect to dashboard
  // Note: Since we're using localStorage, the client-side check in the login page
  // will handle the actual redirect based on role
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/admin/home', request.url));
  }

  // If accessing protected route without token, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};