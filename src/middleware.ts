import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes
const protectedAPIRoutes = [
  '/api/patient',
  '/api/department',
  '/api/ai-insights',
  '/api/chat',
];

// Session validation (for production, use a proper session store)
const sessions = new Map<string, { username: string; expiresAt: Date }>();

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the route is a protected API route
  const isProtectedAPI = protectedAPIRoutes.some(route => pathname.startsWith(route));

  if (isProtectedAPI) {
    // Get session cookie
    const sessionCookie = request.cookies.get('session');

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // In production, validate session against database/redis
    // For now, we'll just check if the cookie exists
    // The actual validation happens in the API route

    // Allow the request to proceed
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all API routes except auth routes
    '/api/:path((?!auth).*)',
  ],
};