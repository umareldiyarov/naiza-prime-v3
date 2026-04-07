'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Win, CreateWinData } from '@/types/wins'

const supabase = createClient()

export type WinFilterPeriod = 'today' | 'week' | 'month' | 'all'

export function useWins() {
    const [wins, setWins] = useState<Win[]>([])
    const [loading, setLoading] = useState(false)

    const loadWins = async () => {
        setLoading(true)
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError) {
                console.error('Auth error:', authError.message || authError)
                return { data: null, error: authError }
            }

            if (!user) {
                console.error('Not authenticated')
                return { data: null, error: new Error('Not authenticated') }
            }

            const { data, error } = await supabase
                .from('wins')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Supabase error loading wins:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                })
                throw error
            }

            const winsData = (data || []) as Win[]
            setWins(winsData)
            return { data: winsData, error: null }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error loading wins:', error.message)
            } else {
                console.error('Unknown error loading wins:', error)
            }
            return { data: null, error }
        } finally {
            setLoading(false)
        }
    }

    const addWin = async (winData: CreateWinData) => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                console.error('Auth error:', authError || 'Not authenticated')
                throw new Error('Not authenticated')
            }

            const { data, error } = await supabase
                .from('wins')
                .insert([{
                    title: winData.title,
                    description: winData.description,
                    size: winData.size,
                    goal_id: winData.goal_id,
                    user_id: user.id
                }])
                .select()
                .single()

            if (error) {
                console.error('Supabase error adding win:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                })
                throw error
            }

            setWins(prev => [data as Win, ...prev])
            return { data, error: null }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error adding win:', error.message)
            } else {
                console.error('Unknown error adding win:', error)
            }
            return { data: null, error }
        }
    }

    const loadWinsByGoal = async (goalId: string) => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                console.error('Auth error:', authError || 'Not authenticated')
                throw new Error('Not authenticated')
            }

            const { data, error } = await supabase
                .from('wins')
                .select('*')
                .eq('user_id', user.id)
                .eq('goal_id', goalId)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Supabase error loading wins by goal:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                })
                throw error
            }

            return { data: (data || []) as Win[], error: null }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error loading wins by goal:', error.message)
            } else {
                console.error('Unknown error loading wins by goal:', error)
            }
            return { data: [], error }
        }
    }

    const filterWinsByPeriod = (period: WinFilterPeriod): Win[] => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        switch (period) {
            case 'today':
                return wins.filter(win => {
                    const winDate = new Date(win.created_at)
                    return winDate >= today
                })

            case 'week':
                const weekAgo = new Date(today)
                weekAgo.setDate(weekAgo.getDate() - 7)
                return wins.filter(win => {
                    const winDate = new Date(win.created_at)
                    return winDate >= weekAgo
                })

            case 'month':
                const monthAgo = new Date(today)
                monthAgo.setDate(monthAgo.getDate() - 30)
                return wins.filter(win => {
                    const winDate = new Date(win.created_at)
                    return winDate >= monthAgo
                })

            case 'all':
            default:
                return wins
        }
    }

    const groupWinsByTime = (wins: Win[]) => {
        const groups: { [key: string]: Win[] } = {}

        wins.forEach(win => {
            const date = new Date(win.created_at)
            const timeKey = date.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            })

            if (!groups[timeKey]) {
                groups[timeKey] = []
            }
            groups[timeKey].push(win)
        })

        return groups
    }

    // ❌ УБРАЛ useEffect — данные загружает DataContext

    const updateWin = async (id: string, updates: Partial<CreateWinData>) => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                console.error('Auth error:', authError || 'Not authenticated')
                throw new Error('Not authenticated')
            }

            const { data, error } = await supabase
                .from('wins')
                .update(updates)
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single()

            if (error) {
                console.error('Supabase error updating win:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                })
                throw error
            }

            setWins(prev => prev.map(w => w.id === id ? data as Win : w))
            return { data, error: null }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error updating win:', error.message)
            } else {
                console.error('Unknown error updating win:', error)
            }
            return { data: null, error }
        }
    }

    const deleteWin = async (id: string) => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                console.error('Auth error:', authError || 'Not authenticated')
                throw new Error('Not authenticated')
            }

            const { error } = await supabase
                .from('wins')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id)

            if (error) {
                console.error('Supabase error deleting win:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                })
                throw error
            }

            setWins(prev => prev.filter(w => w.id !== id))
            return { error: null }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error deleting win:', error.message)
            } else {
                console.error('Unknown error deleting win:', error)
            }
            return { error }
        }
    }

    return {
        wins,
        loading,
        loadWins,
        addWin,
        updateWin,
        deleteWin,
        loadWinsByGoal,
        filterWinsByPeriod,
        groupWinsByTime
    }
}