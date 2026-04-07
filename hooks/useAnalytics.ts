'use client'

/**
 * useAnalytics
 * 
 * Хук для загрузки и анализа данных:
 * - Статистика побед (общее количество, распределение по размеру, динамика, стрики)
 * - Статистика мыслей (настроение, тренды, динамика за период)
 * 
 * Используется на странице статистики для визуализации прогресса
 */

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Win } from '@/types/wins'
import type { Thought } from '@/types/thoughts'

// Интерфейс статистики побед
interface WinStats {
    total: number
    bySize: { small: number; medium: number; large: number }
    last7Days: number
    last30Days: number
    streak: number
    byDate: { date: string; count: number }[]
}

// Интерфейс статистики мыслей
interface ThoughtStats {
    total: number
    byMood: { good: number; neutral: number; bad: number }
    last7Days: { good: number; neutral: number; bad: number }
    moodTrend: 'improving' | 'stable' | 'declining'
    byDate: { date: string; good: number; neutral: number; bad: number }[]
}

// Общий интерфейс аналитики
interface Analytics {
    wins: WinStats | null
    thoughts: ThoughtStats | null
}

export function useAnalytics() {
    const [analytics, setAnalytics] = useState<Analytics>({
        wins: null,
        thoughts: null,
    })
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    /**
     * Загрузка и расчет всей аналитики
     */
    const loadAnalytics = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Загружаем победы и мысли параллельно
            const [winsData, thoughtsData] = await Promise.all([
                supabase.from('wins').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
                supabase.from('thoughts').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
            ])

            // АНАЛИЗ ПОБЕД
            const wins = (winsData.data || []) as Win[]
            const winStats: WinStats = {
                total: wins.length,
                bySize: {
                    small: wins.filter(w => w.size === 'small').length,
                    medium: wins.filter(w => w.size === 'medium').length,
                    large: wins.filter(w => w.size === 'large').length
                },
                last7Days: wins.filter(w =>
                    new Date(w.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length,
                last30Days: wins.filter(w =>
                    new Date(w.created_at) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                ).length,
                streak: calculateWinStreak(wins),
                byDate: aggregateByDate(wins, 30)
            }

            // АНАЛИЗ МЫСЛЕЙ
            const thoughts = (thoughtsData.data || []) as Thought[]
            const last7DaysThoughts = thoughts.filter(t =>
                new Date(t.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            )

            const thoughtStats: ThoughtStats = {
                total: thoughts.length,
                byMood: {
                    good: thoughts.filter(t => t.mood === 'good').length,
                    neutral: thoughts.filter(t => t.mood === 'neutral').length,
                    bad: thoughts.filter(t => t.mood === 'bad').length
                },
                last7Days: {
                    good: last7DaysThoughts.filter(t => t.mood === 'good').length,
                    neutral: last7DaysThoughts.filter(t => t.mood === 'neutral').length,
                    bad: last7DaysThoughts.filter(t => t.mood === 'bad').length
                },
                moodTrend: calculateMoodTrend(thoughts),
                byDate: aggregateThoughtsByDate(thoughts, 30)
            }

            setAnalytics({
                wins: winStats,
                thoughts: thoughtStats
            })

        } catch (error) {
            console.error('Error loading analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    return { analytics, loading, loadAnalytics }
}

// ============================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
// ============================================

/**
 * Рассчитывает текущий стрик побед (количество дней подряд с победами)
 */
function calculateWinStreak(wins: Win[]): number {
    if (wins.length === 0) return 0

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (let i = 0; i < 365; i++) {
        const dateStr = currentDate.toISOString().split('T')[0]
        const hasWin = wins.some(w => w.created_at.startsWith(dateStr))

        if (hasWin) {
            streak++
            currentDate.setDate(currentDate.getDate() - 1)
        } else {
            break
        }
    }

    return streak
}

/**
 * Агрегирует победы по дням для графиков
 */
function aggregateByDate(wins: Win[], days: number): { date: string; count: number }[] {
    const result: { date: string; count: number }[] = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        const count = wins.filter(w => w.created_at.startsWith(dateStr)).length
        result.push({ date: dateStr, count })
    }

    return result
}

/**
 * Агрегирует мысли по дням с распределением по настроению
 */
function aggregateThoughtsByDate(
    thoughts: Thought[],
    days: number
): { date: string; good: number; neutral: number; bad: number }[] {
    const result: { date: string; good: number; neutral: number; bad: number }[] = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]

        const dayThoughts = thoughts.filter(t => t.created_at.startsWith(dateStr))
        result.push({
            date: dateStr,
            good: dayThoughts.filter(t => t.mood === 'good').length,
            neutral: dayThoughts.filter(t => t.mood === 'neutral').length,
            bad: dayThoughts.filter(t => t.mood === 'bad').length
        })
    }

    return result
}

/**
 * Определяет тренд настроения (улучшается / стабильно / ухудшается)
 * Сравнивает первую и вторую половину массива мыслей
 */
function calculateMoodTrend(thoughts: Thought[]): 'improving' | 'stable' | 'declining' {
    if (thoughts.length < 10) return 'stable'

    const recent = thoughts.slice(0, Math.floor(thoughts.length / 2))
    const older = thoughts.slice(Math.floor(thoughts.length / 2))

    const recentScore = recent.reduce((sum: number, t: Thought) => {
        if (t.mood === 'good') return sum + 1
        if (t.mood === 'bad') return sum - 1
        return sum
    }, 0) / recent.length

    const olderScore = older.reduce((sum: number, t: Thought) => {
        if (t.mood === 'good') return sum + 1
        if (t.mood === 'bad') return sum - 1
        return sum
    }, 0) / older.length

    const diff = recentScore - olderScore

    if (diff > 0.2) return 'improving'
    if (diff < -0.2) return 'declining'
    return 'stable'
}