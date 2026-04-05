export interface Profile {
    id: string
    user_id: string
    name?: string
    avatar_url?: string
    notifications_enabled: boolean
    created_at: string
    updated_at: string
}

export interface UpdateProfileData {
    name?: string
    avatar_url?: string | null  // Добавляем | null
    notifications_enabled?: boolean
}

export interface QuickStats {
    wins: number
    thoughts: number
    goals: number
    contacts: number
}