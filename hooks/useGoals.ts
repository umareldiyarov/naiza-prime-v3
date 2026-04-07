'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Goal, CreateGoalInput, UpdateGoalInput, LifeArea } from '@/types/goals'

const supabase = createClient()

export function useGoals() {
    const [goals, setGoals] = useState<Goal[]>([])
    const [areas, setAreas] = useState<LifeArea[]>([])
    const [loading, setLoading] = useState(true)

    

    // Ручная перезагрузка целей
    const fetchGoals = async () => {
        setLoading(true)
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError) {
                console.error('Auth error:', authError.message || authError)
                setGoals([])
                setLoading(false)
                return
            }

            if (!user) {
                console.error('No authenticated user')
                setGoals([])
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('goals')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Supabase error fetching goals:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                })
                setGoals([])
            } else {
                setGoals(data || [])
            }
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error fetching goals:', error.message)
            } else {
                console.error('Unknown error fetching goals:', error)
            }
            setGoals([])
        } finally {
            setLoading(false)
        }
    }

    // Создание цели
    const createGoal = async (input: CreateGoalInput) => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                console.error('Auth error:', authError || 'Not authenticated')
                throw new Error('User not authenticated')
            }

            const { data, error } = await supabase
                .from('goals')
                .insert({
                    ...input,
                    user_id: user.id,
                    current_value: 0,
                    status: 'active',
                })
                .select()
                .single()

            if (error) {
                console.error('Supabase error creating goal:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                })
                throw error
            }

            setGoals(prev => [data, ...prev])
            return data
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error creating goal:', error.message)
            } else {
                console.error('Unknown error creating goal:', error)
            }
            throw error
        }
    }

    // Обновление цели
    const updateGoal = async (id: string, input: UpdateGoalInput) => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                console.error('Auth error:', authError || 'Not authenticated')
                throw new Error('User not authenticated')
            }

            const { data, error } = await supabase
                .from('goals')
                .update({
                    ...input,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single()

            if (error) {
                console.error('Supabase error updating goal:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                })
                throw error
            }

            setGoals(prev => prev.map(g => (g.id === id ? data : g)))
            return data
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error updating goal:', error.message)
            } else {
                console.error('Unknown error updating goal:', error)
            }
            throw error
        }
    }

    // Обновление прогресса
    const updateProgress = async (goalId: string, increment: number) => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                console.error('Auth error:', authError || 'Not authenticated')
                throw new Error('User not authenticated')
            }

            // Получаем свежие данные из БД
            const { data: currentGoal, error: fetchError } = await supabase
                .from('goals')
                .select('*')
                .eq('id', goalId)
                .eq('user_id', user.id)
                .single()

            if (fetchError) {
                console.error('Supabase error fetching goal:', {
                    message: fetchError.message,
                    details: fetchError.details,
                    hint: fetchError.hint
                })
                throw fetchError
            }

            // Вычисляем новое значение
            let newValue = (currentGoal.current_value || 0) + increment

            // Ограничиваем максимум целевым значением
            if (currentGoal.target_value && newValue > currentGoal.target_value) {
                newValue = currentGoal.target_value
            }

            const { data, error } = await supabase
                .from('goals')
                .update({
                    current_value: newValue,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', goalId)
                .eq('user_id', user.id)
                .select()
                .single()

            if (error) {
                console.error('Supabase error updating progress:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                })
                throw error
            }

            // Обновляем состояние
            setGoals(prevGoals => {
                const updatedGoals = prevGoals.map(g =>
                    g.id === goalId ? { ...g, ...data } : g
                )
                return [...updatedGoals]
            })

            return data
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error updating progress:', error.message)
            } else {
                console.error('Unknown error updating progress:', error)
            }
            throw error
        }
    }

    // Удаление цели
    const deleteGoal = async (id: string) => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                console.error('Auth error:', authError || 'Not authenticated')
                throw new Error('User not authenticated')
            }

            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id)

            if (error) {
                console.error('Supabase error deleting goal:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint
                })
                throw error
            }

            setGoals(prev => prev.filter(g => g.id !== id))
        } catch (error) {
            if (error instanceof Error) {
                console.error('Error deleting goal:', error.message)
            } else {
                console.error('Unknown error deleting goal:', error)
            }
            throw error
        }
    }

    // Вычисляемые значения
    const activeGoals = goals.filter(g => g.status === 'active')
    const completedGoals = goals.filter(g => g.status === 'completed')
    const focusGoals = activeGoals
        .filter(g => g.priority === 'high')
        .slice(0, 3)

    // Функция фильтрации
    const filterGoals = (status: string) => {
        if (status === 'all') return goals
        return goals.filter(g => g.status === status)
    }

    // Функция сортировки
    const sortGoals = (goalsList: Goal[], sortBy: string) => {
        const sorted = [...goalsList]

        switch (sortBy) {
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 }
                return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])

            case 'progress':
                return sorted.sort((a, b) => {
                    const progressA = a.target_value ? (a.current_value / a.target_value) * 100 : 0
                    const progressB = b.target_value ? (b.current_value / b.target_value) * 100 : 0
                    return progressB - progressA
                })

            case 'deadline':
                return sorted.sort((a, b) => {
                    if (!a.deadline) return 1
                    if (!b.deadline) return -1
                    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
                })

            case 'created':
            default:
                return sorted.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
        }
    }

    return {
        goals,
        areas,
        loading,
        activeGoals,
        completedGoals,
        focusGoals,
        createGoal,
        updateGoal,
        updateProgress,
        deleteGoal,
        fetchGoals,
        filterGoals,
        sortGoals,
    }
}