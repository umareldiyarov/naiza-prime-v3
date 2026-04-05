'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Win } from '@/types/wins'
import type { Thought } from '@/types/thoughts'
import type { Contact, Interaction } from '@/types/contacts'

interface WinStats {
    total: number
    bySize: { small: number; medium: number; large: number }
    last7Days: number
    last30Days: number
    streak: number
    byDate: { date: string; count: number }[]
}

interface ThoughtStats {
    total: number
    byMood: { good: number; neutral: number; bad: number }
    last7Days: { good: number; neutral: number; bad: number }
    moodTrend: 'improving' | 'stable' | 'declining'
    byDate: { date: string; good: number; neutral: number; bad: number }[]
}

interface ContactStats {
    total: number
    byInfluence: { positive: number; neutral: number; negative: number }
    byCategory: { work: number; friend: number; family: number; mentor: number; partner: number; other: number }
    mostActive: { name: string; count: number }[]
    correlations: {
        name: string
        meetingsCount: number
        positiveOutcomes: number
        avgMoodAfter: 'better' | 'same' | 'worse'
        influence: 'positive' | 'neutral' | 'negative'
    }[]
}

interface Analytics {
    wins: WinStats | null
    thoughts: ThoughtStats | null
    contacts: ContactStats | null
}

export function useAnalytics() {
    const [analytics, setAnalytics] = useState<Analytics>({
        wins: null,
        thoughts: null,
        contacts: null
    })
    const [loading, setLoading] = useState(false)
    const supabase = createClient()

    const loadAnalytics = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Загружаем все данные параллельно
            const [winsData, thoughtsData, contactsData, interactionsData] = await Promise.all([
                supabase.from('wins').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
                supabase.from('thoughts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
                supabase.from('contacts').select('*').eq('user_id', user.id),
                supabase.from('interactions').select('*').eq('user_id', user.id).order('meeting_date', { ascending: false })
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

            // АНАЛИЗ ОКРУЖЕНИЯ
            const contacts = (contactsData.data || []) as Contact[]
            const interactions = (interactionsData.data || []) as Interaction[]

            const contactStats: ContactStats = {
                total: contacts.length,
                byInfluence: {
                    positive: contacts.filter(c => c.influence_type === 'positive').length,
                    neutral: contacts.filter(c => c.influence_type === 'neutral').length,
                    negative: contacts.filter(c => c.influence_type === 'negative').length
                },
                byCategory: {
                    work: contacts.filter(c => c.category === 'work').length,
                    friend: contacts.filter(c => c.category === 'friend').length,
                    family: contacts.filter(c => c.category === 'family').length,
                    mentor: contacts.filter(c => c.category === 'mentor').length,
                    partner: contacts.filter(c => c.category === 'partner').length,
                    other: contacts.filter(c => c.category === 'other').length
                },
                mostActive: calculateMostActive(contacts, interactions),
                correlations: calculateCorrelations(contacts, interactions, wins)
            }

            setAnalytics({
                wins: winStats,
                thoughts: thoughtStats,
                contacts: contactStats
            })

        } catch (error) {
            console.error('Error loading analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    return { analytics, loading, loadAnalytics }
}

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ С ТИПАМИ

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

function calculateMostActive(
    contacts: Contact[],
    interactions: Interaction[]
): { name: string; count: number }[] {
    const counts = new Map<string, { name: string; count: number }>()

    interactions.forEach((interaction: Interaction) => {
        const contact = contacts.find(c => c.id === interaction.contact_id)
        if (contact) {
            const current = counts.get(contact.id) || { name: contact.name, count: 0 }
            counts.set(contact.id, { ...current, count: current.count + 1 })
        }
    })

    return Array.from(counts.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
}

function calculateCorrelations(
    contacts: Contact[],
    interactions: Interaction[],
    wins: Win[]
) {
    return contacts.map((contact: Contact) => {
        const contactInteractions = interactions.filter(i => i.contact_id === contact.id)

        // Считаем встречи где настроение улучшилось
        const positiveOutcomes = contactInteractions.filter(i => i.mood_after === 'better').length

        // Среднее настроение после встреч
        const moodScores = contactInteractions
            .filter((i: Interaction) => i.mood_after !== undefined)
            .map((i: Interaction) => {
                if (i.mood_after === 'better') return 1
                if (i.mood_after === 'worse') return -1
                return 0
            })

        const avgMoodScore = moodScores.length > 0
            ? moodScores.reduce((sum: number, score: number) => sum + score, 0) / moodScores.length
            : 0

        const avgMoodAfter: 'better' | 'same' | 'worse' =
            avgMoodScore > 0.3 ? 'better' :
                avgMoodScore < -0.3 ? 'worse' :
                    'same'

        return {
            name: contact.name,
            meetingsCount: contactInteractions.length,
            positiveOutcomes,
            avgMoodAfter,
            influence: contact.influence_type
        }
    })
        .filter(c => c.meetingsCount > 0)
        .sort((a, b) => b.positiveOutcomes - a.positiveOutcomes)
}