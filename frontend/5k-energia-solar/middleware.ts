import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware que protege rotas de admin e seller
 * Redireciona para /login se o usuário não está autenticado
 */
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const pathname = request.nextUrl.pathname;

  // Rotas que necessitam autenticação
  const protectedRoutes = ['/admin', '/seller', '/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute && !token) {
    // Redireciona para login se não está autenticado
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

// Configurar quais rotas o middleware deve interceptar
export const config = {
  matcher: [
    // Rotas admin
    '/admin/:path*',
    // Rotas seller
    '/seller/:path*',
    // Dashboard
    '/dashboard/:path*',
  ],
};
