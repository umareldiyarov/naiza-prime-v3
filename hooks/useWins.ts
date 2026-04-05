'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client' // 🔧 ПРАВИЛЬНЫЙ ИМПОРТ
import type { Win, CreateWinData } from '@/types/wins'

const supabase = createClient() // 🔧 СОЗДАЁМ КЛИЕНТ

export function useWins() {
    const [wins, setWins] = useState<Win[]>([])
    const [loading, setLoading] = useState(false)

    const loadWins = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('wins')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })

            if (error) throw error

            const winsData = (data || []) as Win[]
            setWins(winsData)
            return { data: winsData, error: null }
        } catch (error) {
            console.error('Error loading wins:', error)
            return { data: null, error }
        } finally {
            setLoading(false)
        }
    }

    const addWin = async (winData: CreateWinData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('wins')
                .insert([{
                    ...winData,
                    user_id: user.id
                }])
                .select()
                .single()

            if (error) throw error

            setWins(prev => [data as Win, ...prev])
            return { data, error: null }
        } catch (error) {
            console.error('Error adding win:', error)
            return { data: null, error }
        }
    }

    useEffect(() => {
        loadWins()
    }, [])

    return {
        wins,
        loading,
        loadWins,
        addWin
    }
}