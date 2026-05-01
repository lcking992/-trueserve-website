import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const host = request.headers.get("host") || ""
  const path = url.pathname

  // --- 1. PREVIEW BYPASS ---
  // --- 1. PREVIEW BYPASS ---
  const isPreviewParam = url.searchParams.get('preview') === 'true'
  const isPreviewCookie = request.cookies.get('preview_mode')?.value === 'true'
  const isTunnel = host.includes('lhr.life') || host.includes('loca.lt')
  const isAuthPath = path === '/login' || path.startsWith('/auth')
  const isPreview = isPreviewParam || isPreviewCookie || (isTunnel && (path.startsWith('/driver') || isAuthPath))
  
  if (isPreviewParam && !isPreviewCookie) {
    const previewResponse = NextResponse.redirect(new URL(url.pathname, request.url))
    previewResponse.cookies.set('preview_mode', 'true', { maxAge: 60 * 5, path: '/' }) // 5 minutes
    return previewResponse
  }

  const isInternal = path.startsWith('/_next') || path.startsWith('/api') || path.includes('.')
  if (isInternal) return NextResponse.next()

  // --- CANONICAL ADMIN DOMAIN: Everything → www.admin.trueserve.delivery ---
  const cleanHostCheck = host.split(':')[0]
  const nonCanonicalAdminHosts = ['admin.trueserve.delivery', 'admin.trueservedelivery.com', 'www.admin.trueservedelivery.com']
  if (nonCanonicalAdminHosts.includes(cleanHostCheck)) {
    return NextResponse.redirect(`https://www.admin.trueserve.delivery${path}${url.search}`)
  }
  const isRootProdHost = cleanHostCheck === 'trueserve.delivery' || cleanHostCheck === 'www.trueserve.delivery'
  if (isRootProdHost && path.startsWith('/admin')) {
    return NextResponse.redirect(`https://www.admin.trueserve.delivery${path}${url.search}`)
  }

  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // --- SECURITY HEADERS (Relaxed for Embedding) ---
  const isEmbed = url.searchParams.get('embed') === 'true';
  
  if (!isEmbed) {
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  }
  
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self), payment=(self)');
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com https://api.launchdarkly.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "worker-src 'self' blob:",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://*.supabase.co https://api.stripe.com https://app.launchdarkly.com https://api.launchdarkly.com wss://*.supabase.co https://sentry.io",
      "frame-src https://js.stripe.com https://hooks.stripe.com",
      isEmbed ? "frame-ancestors *" : "frame-ancestors 'self'",
      "upgrade-insecure-requests",
    ].join('; ')
  );
  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }

  // Determine the cookie domain for universal sessions (including subdomains)
  const cleanHost = host.split(':')[0]
  const isLocal = cleanHost.includes("localhost")
  const isVercel = cleanHost.endsWith(".vercel.app")
  
  // Dynamic root domain detection
  const pieces = cleanHost.split('.')
  let cookieDomain = ""
  
  if (!isLocal && !isVercel && !isTunnel && pieces.length >= 2) {
    cookieDomain = `.${pieces.slice(-2).join('.')}`
  }

  let isSub = isVercel
    ? pieces.length > 3
    : pieces.length > (isLocal ? 1 : 2)

  // FIX: Handle admin.trueserve, merchant.trueserve, driver.trueserve (2-piece domains)
  if (pieces.length === 2 && ['admin', 'merchant', 'driver'].includes(pieces[0].toLowerCase())) {
    isSub = true
  }

  let subdomainPiece = pieces[0].toLowerCase()
  // Handle www prefix for subdomains (e.g., www.admin.domain.com)
  if (subdomainPiece === 'www' && pieces.length > (isLocal ? 2 : 3)) {
    subdomainPiece = pieces[1].toLowerCase()
    isSub = true
  }

  const subdomain = isSub && !['www', 'localhost', 'trueserve'].includes(subdomainPiece) ? subdomainPiece : ""

  // --- 2. SUPABASE SESSION SYNC ---
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          cookiesToSet.forEach(({ name, value, options }) => {
             const sharedOptions = { ...options, domain: cookieDomain }
             response.cookies.set(name, value, sharedOptions)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // --- 3. SUBDOMAIN ROUTING & ROLE PROTECTION ---
  const allowedSubdomains = ["admin", "merchant", "driver"]
  
  if (subdomain && allowedSubdomains.includes(subdomain)) {
    // SECURITY GATE: Only allow internal staff on admin subdomain
    if (subdomain === 'admin') {
      const isAllowedPath = path === '/login' || path.startsWith('/admin/login') || path.startsWith('/auth/callback')
      const adminSession = request.cookies.get('admin_session')?.value === 'true'
      if (!user && !adminSession && !isAllowedPath) return NextResponse.redirect(new URL('/admin/login', request.url))
      
      if (user && !isAllowedPath) {
        const roleResponse = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/User?email=eq.${user.email}&select=role`,
          {
            headers: {
              'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
              'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
            }
          }
        )
        const roles = await roleResponse.json()
        const role = roles?.[0]?.role || 'CUSTOMER'
        if (!['ADMIN', 'PM', 'OPS', 'SUPPORT', 'FINANCE', 'QA_TESTER'].includes(role)) {
          // Redirect to admin login, not main page
          return NextResponse.redirect(new URL('/admin/login', request.url))
        }
      }
    }

    // Rewrite to the internal folder silently (except for shared auth callback)
    if (!path.startsWith(`/${subdomain}`) && !path.startsWith('/auth')) {
      const rewriteUrl = new URL(`/${subdomain}${path}${url.search}`, request.url)
      const rewriteResponse = NextResponse.rewrite(rewriteUrl)
      
      // Transfer cookies/headers
      response.cookies.getAll().forEach(cookie => rewriteResponse.cookies.set(cookie.name, cookie.value))
      response.headers.forEach((v, k) => rewriteResponse.headers.set(k, v))
      
      return rewriteResponse
    }
  }

  // --- 4. PATH-BASED PROTECTION (Fallback) ---
  const portals = ['/admin', '/merchant', '/driver']
  const matchedPortal = portals.find(p => path.startsWith(p))

  if (matchedPortal) {
    // PUBLIC PATHS for Portals: Landing pages and enrollment should NOT require login
    const isPublicPortalPath =
      path === '/merchant' ||
      path === '/driver' ||
      path === '/merchant/login' ||
      path === '/driver/login' ||
      path === '/merchant/tutorial-preview' ||
      path === '/driver/tutorial-preview' ||
      path === '/merchant/portal-preview' ||
      path === '/driver/portal-preview' ||
      path === '/merchant/signup' ||
      path === '/merchant/setup' ||
      path === '/driver/signup' ||
      path === '/admin/login';

    // If it's the admin portal and they have a manual admin_session cookie, let the page-layer auth guard handle it
    if (path.startsWith('/admin')) {
      const hasAdminSession = request.cookies.has("admin_session");
      if (hasAdminSession) {
        // Ensure the cookie is passed through response with proper domain
        const adminSessionCookie = request.cookies.get("admin_session");
        if (adminSessionCookie) {
          response.cookies.set("admin_session", adminSessionCookie.value, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: "/",
            domain: cookieDomain || undefined,
            maxAge: 60 * 60 * 24 * 7 // 7 days
          });
        }
      }
      if (!hasAdminSession && !isPublicPortalPath) {
        return NextResponse.redirect(new URL('/admin/login', request.url))
      }
    } else if (isPublicPortalPath) {
        // Do nothing, let them see the landing/enrollment page
    } else {
        if (!user && !isPreview) {
            // Redirect to the SPECIFIC portal login if possible
            if (path.startsWith('/merchant')) return NextResponse.redirect(new URL('/merchant/login', request.url))
            if (path.startsWith('/driver')) return NextResponse.redirect(new URL('/driver/login', request.url))
            return NextResponse.redirect(new URL('/login', request.url))
        }

        if (user) {
            const roleRes = await fetch(
              `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/User?email=eq.${user.email}&select=role`,
              {
                headers: {
                  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY!,
                  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
                }
              }
            )
            const roles = await roleRes.json()
            const role = roles?.[0]?.role || 'CUSTOMER'

            if (path.startsWith('/admin') && !['ADMIN', 'PM', 'OPS', 'SUPPORT', 'FINANCE', 'QA_TESTER'].includes(role)) {
              // Redirect to admin login, not main page
              return NextResponse.redirect(new URL('/admin/login', request.url))
            }
        }
    }
  }

  // SYNC: Universal UserID Cookie
  if (user && !request.cookies.get('userId')) {
    response.cookies.set('userId', user.id, {
      path: '/',
      domain: cookieDomain,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
