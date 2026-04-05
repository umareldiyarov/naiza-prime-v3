'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trophy, Brain, Target, Users, BarChart3, User } from 'lucide-react'

const tabs = [
    { href: '/wins', label: 'Победы', icon: Trophy },
    { href: '/thoughts', label: 'Мысли', icon: Brain },
    { href: '/goals', label: 'Цели', icon: Target },
    { href: '/contacts', label: 'Окружение', icon: Users },
    { href: '/stats', label: 'Статистика', icon: BarChart3 },
    { href: '/profile', label: 'Профиль', icon: User },
]

export default function BottomNav() {
    const pathname = usePathname()

    return (
        <motion.nav
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md pb-safe"
        >
            <div className="mx-4 mb-4 glass rounded-3xl shadow-lg border border-border/50">
                <div className="flex items-center justify-around px-2 py-3">
                    {tabs.map((tab) => {
                        const isActive = pathname === tab.href
                        const Icon = tab.icon

                        return (
                            <Link
                                key={tab.href}
                                href={tab.href}
                                className="relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute inset-0 bg-primary/10 rounded-2xl"
                                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <motion.div
                                    className="relative z-10"
                                    animate={{
                                        scale: isActive ? 1.1 : 1,
                                    }}
                                    transition={{ type: 'spring', stiffness: 300 }}
                                >
                                    <Icon
                                        className={`w-5 h-5 transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'
                                            }`}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                </motion.div>
                                <span
                                    className={`text-[10px] relative z-10 transition-colors ${isActive
                                        ? 'font-semibold text-primary'
                                        : 'text-muted-foreground'
                                        }`}
                                >
                                    {tab.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </motion.nav>
    )
}