/**
 * database.ts
 * 
 * Типы для таблиц Supabase базы данных
 * Автоматически генерируется из схемы БД
 * 
 * Таблицы:
 * - wins: Победы пользователя
 * - thoughts: Мысли и настроение
 * - goals: Цели и задачи
 */

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
            // Таблица побед
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
            // Таблица мыслей
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
            // Таблица целей
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
        }
    }
}

// Экспортируем типы таблиц для удобства использования
export type Win = Database['public']['Tables']['wins']['Row']
export type Thought = Database['public']['Tables']['thoughts']['Row']
export type Goal = Database['public']['Tables']['goals']['Row']