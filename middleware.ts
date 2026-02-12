import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('authToken')?.value;
  const { pathname } = request.nextUrl;

  // Rotte pubbliche che non richiedono autenticazione
  const publicRoutes = ['/login', '/api/auth/login', '/api/auth/recover-password'];
  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));

  // Se l'utente è autenticato e va al login, reindirizza alla dashboard
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Se l'utente non è autenticato e va a una rotta protetta, reindirizza al login
  if (!token && !isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
