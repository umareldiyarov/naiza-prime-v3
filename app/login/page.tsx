import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginButton from './LoginButton'
import { Check } from 'lucide-react'

export default async function LoginPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        redirect('/wins')
    }

    const features = [
        'Сохраняй победы и моменты силы',
        'Трекай прогресс каждый день',
        'Осознанно планируй будущее'
    ]

    return (
        <main className="relative flex min-h-screen items-center justify-center p-6 bg-zinc-900 overflow-hidden">

            {/* Organic blob shape - LIGHTER */}
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-[600px] h-[600px]">
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-700 via-zinc-600 to-zinc-700 rounded-[40%_60%_70%_30%/60%_30%_70%_40%] blur-3xl opacity-40 animate-blob-slow"></div>
                </div>
            </div>

            {/* Content card - LIGHTER */}
            <div className="relative z-10 w-full max-w-md">
                <div className="bg-zinc-800/80 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-10 shadow-2xl">

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                            NAIZA PRIME
                        </h1>
                        <p className="text-zinc-300 text-sm">
                            Управляй жизнью. Осознанно.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="space-y-4 mb-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="flex items-start gap-3 text-zinc-200"
                                style={{
                                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                }}
                            >
                                <div className="mt-0.5 flex-shrink-0">
                                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-emerald-400" strokeWidth={3} />
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed">{feature}</p>
                            </div>
                        ))}
                    </div>

                    {/* Login Button */}
                    <LoginButton />

                </div>
            </div>

        </main>
    )
}