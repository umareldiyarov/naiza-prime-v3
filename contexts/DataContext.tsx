'use client'

/**
 * DataContext
 * 
 * Глобальный контекст для данных приложения
 * - Загружает победы, мысли, цели один раз при монтировании
 * - Кэширует данные между переключениями вкладок
 * - Предоставляет методы для обновления данных
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Win } from '@/types/wins'
import type { Thought } from '@/types/thoughts'
import type { Goal } from '@/types/goals'

interface DataContextType {
    // Данные
    wins: Win[]
    thoughts: Thought[]
    goals: Goal[]

    // Состояния загрузки
    winsLoading: boolean
    thoughtsLoading: boolean
    goalsLoading: boolean

    // Методы обновления
    refreshWins: () => Promise<void>
    refreshThoughts: () => Promise<void>
    refreshGoals: () => Promise<void>
    refreshAll: () => Promise<void>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
    const [wins, setWins] = useState<Win[]>([])
    const [thoughts, setThoughts] = useState<Thought[]>([])
    const [goals, setGoals] = useState<Goal[]>([])

    const [winsLoading, setWinsLoading] = useState(true)
    const [thoughtsLoading, setThoughtsLoading] = useState(true)
    const [goalsLoading, setGoalsLoading] = useState(true)

    const supabase = createClient()

    // Загрузка побед
    const refreshWins = useCallback(async () => {
        try {
            setWinsLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('wins')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setWins(data || [])
        } catch (error) {
            console.error('Error loading wins:', error)
        } finally {
            setWinsLoading(false)
        }
    }, [supabase])

    // Загрузка мыслей
    const refreshThoughts = useCallback(async () => {
        try {
            setThoughtsLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('thoughts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setThoughts(data || [])
        } catch (error) {
            console.error('Error loading thoughts:', error)
        } finally {
            setThoughtsLoading(false)
        }
    }, [supabase])

    // Загрузка целей
    const refreshGoals = useCallback(async () => {
        try {
            setGoalsLoading(true)
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error
            setGoals(data || [])
        } catch (error) {
            console.error('Error loading goals:', error)
        } finally {
            setGoalsLoading(false)
        }
    }, [supabase])

    // Загрузка всех данных
    const refreshAll = useCallback(async () => {
        await Promise.all([
            refreshWins(),
            refreshThoughts(),
            refreshGoals()
        ])
    }, [refreshWins, refreshThoughts, refreshGoals])

    // Загружаем все данные один раз при монтировании
    useEffect(() => {
        refreshAll()
    }, [refreshAll])

    return (
        <DataContext.Provider
            value={{
                wins,
                thoughts,
                goals,
                winsLoading,
                thoughtsLoading,
                goalsLoading,
                refreshWins,
                refreshThoughts,
                refreshGoals,
                refreshAll
            }}
        >
            {children}
        </DataContext.Provider>
    )
}

// Хук для использования контекста
export function useData() {
    const context = useContext(DataContext)
    if (!context) {
        throw new Error('useData must be used within DataProvider')
    }
    return context
}