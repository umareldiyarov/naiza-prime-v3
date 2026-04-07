'use client'

/**
 * ProfilePage
 * 
 * Страница профиля пользователя:
 * - Информация о пользователе (имя, email, аватар)
 * - Быстрая статистика (победы, мысли, цели)
 * - Прогресс по целям
 * - Информация о приложении
 * - Настройки уведомлений
 * - Управление аккаунтом (выход, удаление)
 */

import { useEffect } from 'react'
import { useProfile } from '@/hooks/useProfile'
import { Button } from '@/components/ui/button'
import { ProfileHeader } from '@/components/profile/ProfileHeader'
import { QuickStatsWidget } from '@/components/profile/QuickStatsWidget'
import { GoalsProgressWidget } from '@/components/profile/GoalsProgressWidget'
import { AboutApp } from '@/components/profile/AboutApp'
import { SettingsSection } from '@/components/profile/SettingsSection'
import { DangerZone } from '@/components/profile/DangerZone'
import { User, LogOut, Loader2 } from 'lucide-react'

export default function ProfilePage() {
    // Получаем данные профиля и методы из хука
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

    // Загружаем данные профиля при монтировании компонента
    useEffect(() => {
        loadProfile()
    }, [])

    // Показываем лоадер пока данные загружаются
    if (loading || !profile || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    // Обработчик загрузки аватара
    const handleUploadAvatar = async (file: File) => {
        const { error } = await uploadAvatar(file)
        if (error) {
            alert('Ошибка загрузки аватара')
        }
    }

    // Обработчик удаления аватара
    const handleDeleteAvatar = async () => {
        const { error } = await deleteAvatar()
        if (error) {
            alert('Ошибка удаления аватара')
        }
    }

    // Обработчик обновления данных профиля (имя, настройки)
    const handleUpdateProfile = async (data: any) => {
        const { error } = await updateProfile(data)
        if (error) {
            alert('Ошибка обновления профиля')
        }
    }

    // Обработчик удаления аккаунта
    const handleDeleteAccount = async () => {
        const { error } = await deleteAccount()
        if (error) {
            alert('Ошибка удаления аккаунта')
        }
    }

    return (
        <div className="min-h-screen p-6 pb-32">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Заголовок страницы */}
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <User className="w-8 h-8 text-primary" strokeWidth={2} />
                        <h1 className="text-3xl font-bold tracking-tight">Профиль</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Управление аккаунтом и настройками
                    </p>
                </div>

                {/* Шапка профиля: аватар, имя, email */}
                <ProfileHeader
                    profile={profile}
                    user={user}
                    uploading={uploading}
                    onUploadAvatar={handleUploadAvatar}
                    onDeleteAvatar={handleDeleteAvatar}
                    onUpdateProfile={handleUpdateProfile}
                />

                {/* Виджет быстрой статистики: количество побед, мыслей, целей */}
                <QuickStatsWidget stats={quickStats} />

                {/* Виджет прогресса по активным целям */}
                <GoalsProgressWidget />

                {/* Модальное окно с информацией о приложении */}
                <AboutApp />

                {/* Секция настроек (уведомления и другие параметры) */}
                <SettingsSection
                    profile={profile}
                    onUpdateProfile={handleUpdateProfile}
                />

                {/* Кнопка выхода из аккаунта */}
                <Button
                    onClick={signOut}
                    variant="outline"
                    className="w-full rounded-xl h-12"
                >
                    <LogOut className="w-4 h-4 mr-2" strokeWidth={2} />
                    Выйти
                </Button>

                {/* Опасная зона: удаление аккаунта */}
                <DangerZone onDeleteAccount={handleDeleteAccount} />

                {/* Отступ для фиксированного навбара внизу */}
                <div className="h-8" />
            </div>
        </div>
    )
}