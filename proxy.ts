import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
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
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // Игнорируем ошибки refresh token при первой загрузке
    try {
        const { data: { user }, error } = await supabase.auth.getUser()

        // Если токен устарел, очищаем и редиректим
        if (error?.message?.includes('refresh_token_not_found') ||
            error?.message?.includes('Invalid Refresh Token')) {
            if (request.nextUrl.pathname !== '/login' &&
                request.nextUrl.pathname !== '/api/auth/callback') {
                const loginUrl = new URL('/login', request.url)
                const redirectResponse = NextResponse.redirect(loginUrl)

                // Очищаем старые куки
                redirectResponse.cookies.delete('sb-access-token')
                redirectResponse.cookies.delete('sb-refresh-token')

                return redirectResponse
            }
            return response
        }

        // Защищаем dashboard роуты
        const protectedRoutes = ['/wins', '/thoughts', '/goals', '/contacts', '/stats', '/profile']
        const isProtectedRoute = protectedRoutes.some(route =>
            request.nextUrl.pathname.startsWith(route)
        )

        if (!user && isProtectedRoute) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Если пользователь залогинен и на /login, редирект на /wins
        if (user && request.nextUrl.pathname === '/login') {
            return NextResponse.redirect(new URL('/wins', request.url))
        }
    } catch (error) {
        console.error('Auth error in proxy:', error)

        // При любой ошибке авторизации — на логин
        if (request.nextUrl.pathname !== '/login' &&
            request.nextUrl.pathname !== '/api/auth/callback') {
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