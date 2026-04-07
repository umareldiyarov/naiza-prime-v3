'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export type ThoughtMood = 'good' | 'neutral' | 'bad'
export type ThoughtFilterPeriod = 'today' | 'week' | 'month' | 'all'

export interface Thought {
    id: string
    user_id: string
    content: string
    mood: ThoughtMood
    created_at: string
}

const supabase = createClient()

export function useThoughts() {
    const [thoughts, setThoughts] = useState<Thought[]>([])
    const [loading, setLoading] = useState(true)

    const loadThoughts = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                setThoughts([])
                setLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('thoughts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (!error && data) {
                setThoughts(data)
            }
        } catch (error) {
            console.error('Error loading thoughts:', error)
        } finally {
            setLoading(false)
        }
    }

    const addThought = async (thought: { content: string; mood: ThoughtMood }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return { error: 'Not authenticated' }

            const { data, error } = await supabase
                .from('thoughts')
                .insert({
                    user_id: user.id,
                    content: thought.content,
                    mood: thought.mood
                })
                .select()
                .single()

            if (!error && data) {
                setThoughts(prev => [data, ...prev])
            }

            return { data, error }
        } catch (error) {
            console.error('Error adding thought:', error)
            return { error }
        }
    }

    const updateThought = async (id: string, updates: { content?: string; mood?: ThoughtMood }) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return { error: 'Not authenticated' }

            const { data, error } = await supabase
                .from('thoughts')
                .update(updates)
                .eq('id', id)
                .eq('user_id', user.id)
                .select()
                .single()

            if (!error && data) {
                setThoughts(prev => prev.map(t => t.id === id ? data : t))
            }

            return { data, error }
        } catch (error) {
            console.error('Error updating thought:', error)
            return { error }
        }
    }

    const deleteThought = async (id: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return { error: 'Not authenticated' }

            const { error } = await supabase
                .from('thoughts')
                .delete()
                .eq('id', id)
                .eq('user_id', user.id)

            if (!error) {
                setThoughts(prev => prev.filter(t => t.id !== id))
            }

            return { error }
        } catch (error) {
            console.error('Error deleting thought:', error)
            return { error }
        }
    }

    const filterThoughtsByPeriod = (period: ThoughtFilterPeriod): Thought[] => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        switch (period) {
            case 'today':
                return thoughts.filter(t => new Date(t.created_at) >= today)
            case 'week':
                const weekAgo = new Date(today)
                weekAgo.setDate(weekAgo.getDate() - 7)
                return thoughts.filter(t => new Date(t.created_at) >= weekAgo)
            case 'month':
                const monthAgo = new Date(today)
                monthAgo.setMonth(monthAgo.getMonth() - 1)
                return thoughts.filter(t => new Date(t.created_at) >= monthAgo)
            case 'all':
            default:
                return thoughts
        }
    }

    const groupThoughtsByDate = (thoughts: Thought[]): Record<string, Thought[]> => {
        const groups: Record<string, Thought[]> = {}

        thoughts.forEach(thought => {
            const date = new Date(thought.created_at).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })

            if (!groups[date]) {
                groups[date] = []
            }
            groups[date].push(thought)
        })

        return groups
    }

    useEffect(() => {
        loadThoughts()
    }, [])

    return {
        thoughts,
        loading,
        loadThoughts,
        addThought,
        updateThought,
        deleteThought,
        filterThoughtsByPeriod,
        groupThoughtsByDate
    }
}