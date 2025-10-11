import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const response = NextResponse.next();

    // Add X-Robots-Tag header to all API routes for SEO protection
    if (req.nextUrl.pathname.startsWith('/api/')) {
      response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

// Protect these routes + add SEO headers to API routes
export const config = {
  matcher: [
    '/submit-problem',
    '/project-tracker',
    '/problems/:path*',
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/:path*',
  ],
};
