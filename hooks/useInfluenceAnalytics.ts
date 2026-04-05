'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ContactInfluenceScore, ShadowCost } from '@/types/contacts'
import type { Win } from '@/types/wins'
import type { Interaction } from '@/types/contacts'
import type { Goal } from '@/types/goals'

export function useInfluenceAnalytics() {
    const [loading, setLoading] = useState(false)
    const [influenceScores, setInfluenceScores] = useState<ContactInfluenceScore[]>([])
    const supabase = createClient()

    // Загрузка и расчёт векторов влияния
    const calculateInfluenceVectors = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Загружаем все данные
            const [contactsData, interactionsData, winsData, goalsData] = await Promise.all([
                supabase.from('contacts').select('*').eq('user_id', user.id),
                supabase.from('interactions').select('*').eq('user_id', user.id).order('meeting_date'),
                supabase.from('wins').select('*').eq('user_id', user.id).order('created_at'),
                supabase.from('goals').select('id, steps').eq('user_id', user.id)
            ])

            const contacts = contactsData.data || []
            const interactions = interactionsData.data || []
            const wins = winsData.data || []
            const goals = goalsData.data || []

            // Считаем среднюю скорость закрытия подцелей (для Shadow Cost)
            const avgHoursPerGoalStep = calculateAvgHoursPerGoalStep(goals, interactions)

            // Для каждого контакта считаем влияние
            const scores: ContactInfluenceScore[] = contacts.map(contact => {
                const contactInteractions = interactions.filter(i => i.contact_id === contact.id)

                if (contactInteractions.length === 0) {
                    return createEmptyScore(contact)
                }

                return calculateContactScore(
                    contact,
                    contactInteractions,
                    wins,
                    avgHoursPerGoalStep
                )
            })

            // Сортируем: сначала якоря, потом ускорители, потом нейтральные
            scores.sort((a, b) => {
                if (a.vector_type === 'anchor' && b.vector_type !== 'anchor') return -1
                if (a.vector_type !== 'anchor' && b.vector_type === 'anchor') return 1
                if (a.vector_type === 'accelerator' && b.vector_type !== 'accelerator') return -1
                if (a.vector_type !== 'accelerator' && b.vector_type === 'accelerator') return 1
                return b.vector_strength - a.vector_strength
            })

            setInfluenceScores(scores)
        } catch (error) {
            console.error('Error calculating influence vectors:', error)
        } finally {
            setLoading(false)
        }
    }

    // Расчёт Shadow Cost для конкретной встречи
    const calculateMeetingShadowCost = (
        durationHours: number,
        avgHoursPerGoalStep: number
    ): ShadowCost => {
        const hoursInWeek = 16 * 7 // 16 часов бодрствования * 7 дней

        return {
            hours_spent: durationHours,
            potential_goals_completed: Math.round((durationHours / avgHoursPerGoalStep) * 10) / 10,
            percentage_of_week: Math.round((durationHours / hoursInWeek) * 100)
        }
    }

    return {
        loading,
        influenceScores,
        calculateInfluenceVectors,
        calculateMeetingShadowCost
    }
}

// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ

function calculateAvgHoursPerGoalStep(goals: any[], interactions: Interaction[]): number {
    // Считаем общее количество подцелей
    const totalSteps = goals.reduce((sum, goal) => {
        return sum + (goal.steps?.length || 0)
    }, 0)

    // Считаем общее время на встречи (это очень грубая оценка)
    const totalInteractionHours = interactions.reduce((sum, i) => {
        return sum + (i.duration_hours || 0)
    }, 0)

    // Предполагаем, что на выполнение задач уходит примерно половина времени
    // (остальное — встречи, отдых и т.д.)
    const estimatedWorkHours = totalInteractionHours * 0.5

    if (totalSteps === 0 || estimatedWorkHours === 0) {
        return 1.5 // Дефолтное значение: 1.5 часа на подцель
    }

    return estimatedWorkHours / totalSteps
}

function createEmptyScore(contact: any): ContactInfluenceScore {
    return {
        contact_id: contact.id,
        contact_name: contact.name,
        category: contact.category,
        influence_type: contact.influence_type,
        total_meetings: 0,
        total_hours_spent: 0,
        wins_before_avg: 0,
        wins_after_avg: 0,
        wins_delta: 0,
        shadow_cost_goals: 0,
        mood_improvement_rate: 0,
        vector_type: 'neutral',
        vector_strength: 0
    }
}

function calculateContactScore(
    contact: any,
    interactions: Interaction[],
    wins: Win[],
    avgHoursPerGoalStep: number
): ContactInfluenceScore {
    const totalMeetings = interactions.length
    const totalHours = interactions.reduce((sum, i) => sum + (i.duration_hours || 0), 0)

    // Считаем корреляцию с победами
    let winsBeforeSum = 0
    let winsAfterSum = 0
    let validMeetings = 0

    interactions.forEach(interaction => {
        const meetingDate = new Date(interaction.meeting_date)

        // Победы за 24 часа ДО встречи
        const winsBefore = wins.filter(win => {
            const winDate = new Date(win.created_at)
            const hoursDiff = (meetingDate.getTime() - winDate.getTime()) / (1000 * 60 * 60)
            return hoursDiff >= 0 && hoursDiff <= 24
        }).length

        // Победы за 24-48 часов ПОСЛЕ встречи
        const winsAfter = wins.filter(win => {
            const winDate = new Date(win.created_at)
            const hoursDiff = (winDate.getTime() - meetingDate.getTime()) / (1000 * 60 * 60)
            return hoursDiff >= 24 && hoursDiff <= 48
        }).length

        winsBeforeSum += winsBefore
        winsAfterSum += winsAfter
        validMeetings++
    })

    const winsBeforeAvg = validMeetings > 0 ? winsBeforeSum / validMeetings : 0
    const winsAfterAvg = validMeetings > 0 ? winsAfterSum / validMeetings : 0

    // Дельта в процентах
    const winsDelta = winsBeforeAvg > 0
        ? Math.round(((winsAfterAvg - winsBeforeAvg) / winsBeforeAvg) * 100)
        : 0

    // Shadow Cost
    const shadowCostGoals = Math.round((totalHours / avgHoursPerGoalStep) * 10) / 10

    // Процент улучшения настроения
    const moodImprovements = interactions.filter(i => i.mood_after === 'better').length
    const moodImprovementRate = totalMeetings > 0
        ? Math.round((moodImprovements / totalMeetings) * 100)
        : 0

    // Определяем тип вектора
    let vectorType: 'accelerator' | 'anchor' | 'neutral' = 'neutral'
    let vectorStrength = Math.abs(winsDelta)

    if (winsDelta > 15) {
        vectorType = 'accelerator'
    } else if (winsDelta < -15) {
        vectorType = 'anchor'
    }

    return {
        contact_id: contact.id,
        contact_name: contact.name,
        category: contact.category,
        influence_type: contact.influence_type,
        total_meetings: totalMeetings,
        total_hours_spent: Math.round(totalHours * 10) / 10,
        wins_before_avg: Math.round(winsBeforeAvg * 10) / 10,
        wins_after_avg: Math.round(winsAfterAvg * 10) / 10,
        wins_delta: winsDelta,
        shadow_cost_goals: shadowCostGoals,
        mood_improvement_rate: moodImprovementRate,
        vector_type: vectorType,
        vector_strength: vectorStrength
    }
}