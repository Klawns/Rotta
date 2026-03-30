import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/register', '/pricing', '/area-restrita'];
const adminRoutes = ['/admin'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token =
    request.cookies.get('access_token')?.value ??
    request.cookies.get('refresh_token')?.value;
  const adminToken =
    request.cookies.get('admin_access_token')?.value ??
    request.cookies.get('admin_refresh_token')?.value;

  const isAuthenticated = Boolean(token && token.length > 20);
  const isAdminAuthenticated = Boolean(adminToken && adminToken.length > 20);

  const redirect = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url);
  };

  if (pathname === '/') {
    if (isAuthenticated && !isAdminAuthenticated) {
      return redirect('/dashboard');
    }

    return NextResponse.next();
  }

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));

  if (isPublicRoute && isAuthenticated && !isAdminAuthenticated) {
    return redirect('/dashboard');
  }

  if (isAdminRoute && !isAdminAuthenticated) {
    return redirect('/login');
  }

  if (pathname.startsWith('/dashboard') && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next|favicon.ico|assets|images|fonts|.*\\..*).*)',
  ],
};
