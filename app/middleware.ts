// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get auth token from HTTP-only cookie
  const token = request.cookies.get('token')?.value;

  // Define route types
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/change-password');
  const isAdminRoute = pathname.startsWith('/admin');
  const isKasirRoute = pathname.startsWith('/kasir');
  const isProtectedRoute = isAdminRoute || isKasirRoute;
  const isRootRoute = pathname === '/';

  // Redirect root to login if not authenticated, or to dashboard if authenticated
  if (isRootRoute) {
    if (token) {
      // User is authenticated, redirect to default dashboard
      // You might want to decode the token to get role, or make an API call
      return NextResponse.redirect(new URL('/admin/home', request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If user is authenticated and tries to access login page (but not change-password)
  if (pathname.startsWith('/login') && token) {
    return NextResponse.redirect(new URL('/admin/home', request.url));
  }

  // If user is not authenticated and tries to access protected routes, redirect to login
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Allow change-password route if authenticated
  if (pathname.startsWith('/change-password') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Create response and ensure credentials are included
  const response = NextResponse.next();
  
  // Add CORS headers if needed for API routes
  if (pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Credentials', 'true');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
};