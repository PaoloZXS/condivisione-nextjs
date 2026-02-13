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
    // Salva la URL richiesta per il reindirizzamento post-login
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('redirectUrl', pathname, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600 // 10 minuti
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
