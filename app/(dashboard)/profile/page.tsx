'use client'

import { useEffect } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { QuickStatsWidget } from '@/components/profile/QuickStatsWidget'
import { GoalsProgressWidget } from '@/components/profile/GoalsProgressWidget'
import { AboutApp } from '@/components/profile/AboutApp'
import { SettingsSection } from '@/components/profile/SettingsSection'
import { DangerZone } from '@/components/profile/DangerZone'
import { motion } from 'framer-motion'
import { User, LogOut, Loader2 } from 'lucide-react'

export default function ProfilePage() {
    const {
        profile,
        user,
        quickStats,
        loading,
        uploading,
        loadProfile,
        updateProfile,
        uploadAvatar,
        deleteAvatar,
        signOut,
        deleteAccount
    } = useProfile()

    useEffect(() => {
        loadProfile()
    }, [])

    if (loading || !profile || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    const handleUploadAvatar = async (file: File) => {
        const { error } = await uploadAvatar(file)
        if (error) {
            alert('Ошибка загрузки аватара')
        }
    }

    const handleDeleteAvatar = async () => {
        const { error } = await deleteAvatar()
        if (error) {
            alert('Ошибка удаления аватара')
        }
    }

    const handleUpdateProfile = async (data: any) => {
        const { error } = await updateProfile(data)
        if (error) {
            alert('Ошибка обновления профиля')
        }
    }

    const handleDeleteAccount = async () => {
        const { error } = await deleteAccount()
        if (error) {
            alert('Ошибка удаления аккаунта')
        }
    }

    return (
        <div className="min-h-screen p-6 pb-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl mx-auto space-y-6"
            >
                {/* Header */}
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-primary" strokeWidth={2} />
                        <h1 className="text-3xl font-bold tracking-tight">Профиль</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Управление аккаунтом и настройками
                    </p>
                </div>

                {/* Профиль */}
                <ProfileHeader
                    profile={profile}
                    user={user}
                    uploading={uploading}
                    onUploadAvatar={handleUploadAvatar}
                    onDeleteAvatar={handleDeleteAvatar}
                    onUpdateProfile={handleUpdateProfile}
                />

                {/* Быстрая статистика */}
                <QuickStatsWidget stats={quickStats} />

                {/* Прогресс целей */}
                <GoalsProgressWidget />

                {/* О приложении */}
                <AboutApp />

                {/* Настройки */}
                <SettingsSection
                    profile={profile}
                    onUpdateProfile={handleUpdateProfile}
                />

                {/* Кнопка выхода */}
                <Button
                    onClick={signOut}
                    variant="outline"
                    className="w-full rounded-xl h-12"
                >
                    <LogOut className="w-4 h-4 mr-2" strokeWidth={2} />
                    Выйти
                </Button>

                {/* Опасная зона */}
                <DangerZone onDeleteAccount={handleDeleteAccount} />

                {/* Spacer для навбара */}
                <div className="h-8" />
            </motion.div>
        </div>
    )
}