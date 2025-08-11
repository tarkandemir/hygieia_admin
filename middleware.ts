import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Public paths that don't require authentication
  const publicPaths = ['/login', '/api/auth/login', '/api/auth/logout'];
  
  if (publicPaths.includes(path)) {
    return NextResponse.next();
  }

  // Check for auth token in cookies
  const token = request.cookies.get('auth-token')?.value;

  console.log('🔍 Middleware Debug:', {
    path,
    hasToken: !!token,
    tokenLength: token?.length,
    cookies: request.cookies.getAll().map(c => ({ name: c.name, hasValue: !!c.value }))
  });

  if (!token) {
    console.log('❌ No token found, redirecting to login');
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify the token with jose (Edge Runtime compatible)
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret');
    const { payload } = await jwtVerify(token, secret);
    
    console.log('✅ Token valid for user:', payload.email);
    
    // Add user info to request headers for API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', payload.userId as string);
    requestHeaders.set('x-user-role', payload.role as string);
    requestHeaders.set('x-user-email', payload.email as string);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.log('❌ Invalid token, redirecting to login');
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth-token');
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * Note: /api/auth/me should go through middleware to get headers
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 