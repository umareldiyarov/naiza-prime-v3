'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client' // 🔧 ПРАВИЛЬНЫЙ ИМПОРТ
import type { Thought, CreateThoughtData } from '@/types/thoughts'

const supabase = createClient() // 🔧 СОЗДАЁМ КЛИЕНТ

export function useThoughts() {
    const [thoughts, setThoughts] = useState<Thought[]>([])
    const [loading, setLoading] = useState(false)

    const loadThoughts = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('thoughts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            setThoughts(data || [])
            return { data: data || [], error: null }
        } catch (error) {
            console.error('Error loading thoughts:', error)
            return { data: null, error }
        } finally {
            setLoading(false)
        }
    }

    const addThought = async (thoughtData: CreateThoughtData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('thoughts')
                .insert([{
                    ...thoughtData,
                    user_id: user.id
                }])
                .select()
                .single()

            if (error) throw error

            setThoughts(prev => [data, ...prev])
            return { data, error: null }
        } catch (error) {
            console.error('Error adding thought:', error)
            return { data: null, error }
        }
    }

    useEffect(() => {
        loadThoughts()
    }, [])

    return {
        thoughts,
        loading,
        loadThoughts,
        addThought
    }
}