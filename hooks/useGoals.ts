'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Goal, CreateGoalData, UpdateGoalData } from '@/types/goals'

export function useGoals() {
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const loadGoals = async (status?: 'active' | 'completed' | 'postponed') => {
        setLoading(true)
        try {
            let query = supabase
                .from('goals')
                .select('*')
                .order('created_at', { ascending: false })

            if (status) {
                query = query.eq('status', status)
            }

            const { data, error } = await query

            if (error) throw error
            setGoals(data || [])
            return { data, error: null }
        } catch (error) {
            console.error('Error loading goals:', error)
            return { data: null, error }
        } finally {
            setLoading(false)
        }
    }

    const addGoal = async (goalData: CreateGoalData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('goals')
                .insert({
                    user_id: user.id,
                    title: goalData.title,
                    description: goalData.description,
                    deadline: goalData.deadline,
                    status: 'active'
                })
                .select()
                .single()

            if (error) throw error

            setGoals(prev => [data, ...prev])
            return { data, error: null }
        } catch (error) {
            console.error('Error adding goal:', error)
            return { data: null, error }
        }
    }

    const updateGoal = async (id: string, updates: UpdateGoalData) => {
        try {
            const updateData: any = { ...updates, updated_at: new Date().toISOString() }

            if (updates.status === 'completed' && !updates.completed_at) {
                updateData.completed_at = new Date().toISOString()
            }

            const { data, error } = await supabase
                .from('goals')
                .update(updateData)
                .eq('id', id)
                .select()
                .single()

            if (error) throw error

            setGoals(prev => prev.map(g => g.id === id ? data : g))
            return { data, error: null }
        } catch (error) {
            console.error('Error updating goal:', error)
            return { data: null, error }
        }
    }

    const deleteGoal = async (id: string) => {
        try {
            const { error } = await supabase
                .from('goals')
                .delete()
                .eq('id', id)

            if (error) throw error

            setGoals(prev => prev.filter(g => g.id !== id))
            return { error: null }
        } catch (error) {
            console.error('Error deleting goal:', error)
            return { error }
        }
    }

    return {
        goals,
        loading,
        loadGoals,
        addGoal,
        updateGoal,
        deleteGoal
    }
}