/**
 * profile.ts
 * 
 * Типы для профиля пользователя и быстрой статистики
 */

// Основная информация о профиле пользователя
export interface Profile {
    id: string
    user_id: string
    name?: string
    avatar_url?: string
    notifications_enabled: boolean
    created_at: string
    updated_at: string
}

// Данные для обновления профиля
export interface UpdateProfileData {
    name?: string
    avatar_url?: string | null
    notifications_enabled?: boolean
}

// Быстрая статистика для виджета на странице профиля
export interface QuickStats {
    wins: number       // Количество побед
    thoughts: number   // Количество мыслей
    goals: number      // Количество целей
}