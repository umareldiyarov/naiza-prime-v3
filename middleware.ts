import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    )
                    response = NextResponse.next({ request })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    try {
        const { data: { user }, error } = await supabase.auth.getUser()

        if (error?.message?.includes('refresh_token_not_found') ||
            error?.message?.includes('Invalid Refresh Token')) {
            if (request.nextUrl.pathname !== '/login') {
                const redirectResponse = NextResponse.redirect(
                    new URL('/login', request.url)
                )
                redirectResponse.cookies.delete('sb-access-token')
                redirectResponse.cookies.delete('sb-refresh-token')
                return redirectResponse
            }
            return response
        }

        const protectedRoutes = ['/wins', '/thoughts', '/goals', '/stats', '/profile']
        const isProtected = protectedRoutes.some(route =>
            request.nextUrl.pathname.startsWith(route)
        )

        if (!user && isProtected) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        if (user && request.nextUrl.pathname === '/login') {
            return NextResponse.redirect(new URL('/wins', request.url))
        }

    } catch {
        if (request.nextUrl.pathname !== '/login') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}