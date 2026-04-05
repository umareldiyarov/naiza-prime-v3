export type WinSize = 'small' | 'medium' | 'large'

export interface Win {
    id: string
    user_id: string
    title: string
    description?: string
    size: WinSize
    created_at: string
}

export interface CreateWinData {
    title: string
    description?: string
    size: WinSize
}