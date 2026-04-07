/**
 * Middleware (proxy.ts)
 * 
 * Обрабатывает авторизацию и защиту роутов:
 * - Проверяет токены и сессию пользователя
 * - Редиректит незалогиненых с защищённых страниц на /login
 * - Редиректит залогиненых с /login на /wins
 * - Очищает устаревшие токены при ошибках
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    // Создаём Supabase клиент с поддержкой cookies
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

    try {
        const { data: { user }, error } = await supabase.auth.getUser()

        // Если токен устарел — очищаем cookies и редиректим на логин
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

        // Список защищённых страниц (требуют авторизации)
        const protectedRoutes = ['/wins', '/thoughts', '/goals', '/stats', '/profile']
        const isProtectedRoute = protectedRoutes.some(route =>
            request.nextUrl.pathname.startsWith(route)
        )

        // Если не залогинен и пытается зайти на защищённую страницу → на логин
        if (!user && isProtectedRoute) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        // Если залогинен и на странице логина → редирект на главную (Победы)
        if (user && request.nextUrl.pathname === '/login') {
            return NextResponse.redirect(new URL('/wins', request.url))
        }
    } catch (error) {
        console.error('Auth error in proxy:', error)

        // При любой ошибке авторизации редиректим на логин
        if (request.nextUrl.pathname !== '/login' &&
            request.nextUrl.pathname !== '/api/auth/callback') {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return response
}

// Применяем middleware ко всем роутам кроме статики
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}