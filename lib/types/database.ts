export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            wins: {
                Row: {
                    id: string
                    created_at: string
                    user_id: string
                    content: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                    user_id: string
                    content: string
                }
                Update: {
                    id?: string
                    created_at?: string
                    user_id?: string
                    content?: string
                }
            }
            thoughts: {
                Row: {
                    id: string
                    created_at: string
                    user_id: string
                    content: string
                    mood: 'good' | 'neutral' | 'bad'
                }
                Insert: {
                    id?: string
                    created_at?: string
                    user_id: string
                    content: string
                    mood: 'good' | 'neutral' | 'bad'
                }
                Update: {
                    id?: string
                    created_at?: string
                    user_id?: string
                    content?: string
                    mood?: 'good' | 'neutral' | 'bad'
                }
            }
            goals: {
                Row: {
                    id: string
                    created_at: string
                    user_id: string
                    title: string
                    description: string | null
                    status: 'active' | 'completed' | 'archived'
                    deadline: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    user_id: string
                    title: string
                    description?: string | null
                    status?: 'active' | 'completed' | 'archived'
                    deadline?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    user_id?: string
                    title?: string
                    description?: string | null
                    status?: 'active' | 'completed' | 'archived'
                    deadline?: string | null
                }
            }
            contacts: {
                Row: {
                    id: string
                    created_at: string
                    user_id: string
                    name: string
                    relationship: string | null
                    notes: string | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    user_id: string
                    name: string
                    relationship?: string | null
                    notes?: string | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    user_id?: string
                    name?: string
                    relationship?: string | null
                    notes?: string | null
                }
            }
        }
    }
}

// Экспортируем типы для удобства
export type Win = Database['public']['Tables']['wins']['Row']
export type Thought = Database['public']['Tables']['thoughts']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']
export type Contact = Database['public']['Tables']['contacts']['Row']