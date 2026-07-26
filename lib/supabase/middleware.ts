import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { env } from '@/lib/env';

const AUTH_ROUTES = ['/login', '/signup', '/forgot-password', '/reset-password'];
// Internal documentation, not part of the authenticated product — no session required.
const PUBLIC_ROUTES = ['/style-guide'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  // API routes authenticate themselves (cookie session inside the route
  // via getCurrentUser(), or — for /api/shortcuts/* — a bearer token with
  // no cookie session at all). Redirecting an unauthenticated API request
  // to /login here breaks token-authenticated clients like the iOS
  // Shortcuts integration, which never sends the app's session cookie.
  if (request.nextUrl.pathname.startsWith('/api/')) {
    return response;
  }

  const supabase = createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));
  const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  if (isPublicRoute) {
    return response;
  }

  if (!user && !isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}
