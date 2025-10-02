import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (pathname === '/login' || pathname === '/register') {
    return NextResponse.next();
  }

  // Protect todolist route
  if (pathname.startsWith('/todolist')) {
    const user = request.cookies.get('user');

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/todolist/:path*', '/login', '/register'],
};
