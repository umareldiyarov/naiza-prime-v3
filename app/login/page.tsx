import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginButton from './LoginButton'

export default async function LoginPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/wins')
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm flex flex-col gap-6 items-center">
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-bold">Вход в DentOS</h1>
                    <p className="text-muted-foreground">
                        Твой личный дневник побед и окружения
                    </p>
                </div>
                <LoginButton />
            </div>
        </main>
    )
}