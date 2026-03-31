import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const publicRoutes = ['/login', '/register', '/pricing', '/area-restrita'];
const adminRoutes = ['/admin'];

function hasTokenValue(value: string | undefined) {
  return Boolean(value && value.length > 20);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken = request.cookies.get('access_token')?.value;
  const refreshToken = request.cookies.get('refresh_token')?.value;
  const hasAccess = hasTokenValue(accessToken);
  const hasSessionCandidate = hasAccess || hasTokenValue(refreshToken);

  const isPublicRoute = publicRoutes.some((route) => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route));
  const shouldRedirectPublicRoute =
    isPublicRoute && pathname !== '/area-restrita' && hasAccess;

  const redirect = (path: string) => {
    const url = request.nextUrl.clone();
    url.pathname = path;
    return NextResponse.redirect(url);
  };

  if (pathname === '/') {
    if (hasAccess) {
      return redirect('/dashboard');
    }

    return NextResponse.next();
  }

  if (shouldRedirectPublicRoute) {
    return redirect('/dashboard');
  }

  if (isAdminRoute && !hasSessionCandidate) {
    return redirect('/area-restrita');
  }

  if (pathname.startsWith('/dashboard') && !hasSessionCandidate) {
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
