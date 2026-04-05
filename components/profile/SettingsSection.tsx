'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Moon, Sun, Bell, BellOff } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Profile, UpdateProfileData } from '@/types/profile'

interface SettingsSectionProps {
    profile: Profile
    onUpdateProfile: (data: UpdateProfileData) => Promise<void>
}

export function SettingsSection({ profile, onUpdateProfile }: SettingsSectionProps) {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')
    const [notifications, setNotifications] = useState(profile.notifications_enabled)

    useEffect(() => {
        // Проверяем текущую тему
        const isDark = document.documentElement.classList.contains('dark')
        setTheme(isDark ? 'dark' : 'light')
    }, [])

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light'
        setTheme(newTheme)

        if (newTheme === 'dark') {
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }

    const toggleNotifications = async () => {
        const newValue = !notifications
        setNotifications(newValue)
        await onUpdateProfile({ notifications_enabled: newValue })
    }

    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-lg">⚙️ Настройки</h3>

            <Card className="p-5 space-y-4">
                {/* Тема */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {theme === 'dark' ? (
                            <Moon className="w-5 h-5 text-purple-600" strokeWidth={2} />
                        ) : (
                            <Sun className="w-5 h-5 text-yellow-600" strokeWidth={2} />
                        )}
                        <div>
                            <p className="font-medium">Тема</p>
                            <p className="text-sm text-muted-foreground">
                                {theme === 'dark' ? 'Тёмная' : 'Светлая'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className="relative w-14 h-8 rounded-full transition-colors bg-muted"
                    >
                        <motion.div
                            className="absolute top-1 w-6 h-6 rounded-full bg-primary shadow-lg"
                            animate={{ left: theme === 'dark' ? '28px' : '4px' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    </button>
                </div>

                {/* Уведомления */}
                <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                        {notifications ? (
                            <Bell className="w-5 h-5 text-blue-600" strokeWidth={2} />
                        ) : (
                            <BellOff className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
                        )}
                        <div>
                            <p className="font-medium">Уведомления</p>
                            <p className="text-sm text-muted-foreground">
                                {notifications ? 'Включены' : 'Выключены'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={toggleNotifications}
                        className="relative w-14 h-8 rounded-full transition-colors bg-muted"
                    >
                        <motion.div
                            className={`absolute top-1 w-6 h-6 rounded-full shadow-lg ${notifications ? 'bg-primary' : 'bg-muted-foreground'
                                }`}
                            animate={{ left: notifications ? '28px' : '4px' }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        />
                    </button>
                </div>
            </Card>
        </div>
    )
}