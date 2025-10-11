import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
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

// Protect these routes
export const config = {
  matcher: [
    '/submit-problem',
    '/project-tracker',
    '/problems/:path*',
    '/dashboard/:path*',
  ],
};
