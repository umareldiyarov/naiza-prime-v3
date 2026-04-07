'use client'

import { useMemo } from 'react'
import { useGoals } from './useGoals'
import type { GoalStats, AreaStats, PriorityStats } from '@/types/stats'

export function useGoalStats() {
    const { goals, areas } = useGoals()

    const stats: GoalStats = useMemo(() => {
        const totalGoals = goals.length
        const activeGoals = goals.filter(g => g.status === 'active').length
        const completedGoals = goals.filter(g => g.status === 'completed').length
        const pausedGoals = goals.filter(g => g.status === 'paused').length
        const cancelledGoals = goals.filter(g => g.status === 'cancelled').length

        const completionRate = totalGoals > 0
            ? Math.round((completedGoals / totalGoals) * 100)
            : 0

        // Средний прогресс активных целей
        const activeGoalsWithProgress = goals.filter(
            g => g.status === 'active' && g.target_value && g.target_value > 0
        )
        const averageProgress = activeGoalsWithProgress.length > 0
            ? Math.round(
                activeGoalsWithProgress.reduce((sum, g) => {
                    return sum + (g.current_value / g.target_value!) * 100
                }, 0) / activeGoalsWithProgress.length
            )
            : 0

        // Цели завершённые за этот месяц
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const goalsCompletedThisMonth = goals.filter(
            g => g.status === 'completed' &&
                g.updated_at &&
                new Date(g.updated_at) >= startOfMonth
        ).length

        // Цели завершённые за эту неделю
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        const goalsCompletedThisWeek = goals.filter(
            g => g.status === 'completed' &&
                g.updated_at &&
                new Date(g.updated_at) >= startOfWeek
        ).length

        // Общий прогресс всех целей
        const totalProgress = goals.reduce((sum, g) => {
            if (g.target_value && g.target_value > 0) {
                return sum + g.current_value
            }
            return sum
        }, 0)

        return {
            totalGoals,
            activeGoals,
            completedGoals,
            pausedGoals,
            cancelledGoals,
            completionRate,
            averageProgress,
            goalsCompletedThisMonth,
            goalsCompletedThisWeek,
            totalProgress,
        }
    }, [goals])

    // Статистика по сферам жизни
    const areaStats: AreaStats[] = useMemo(() => {
        return areas.map(area => {
            const areaGoals = goals.filter(g => g.area_id === area.id)
            const completedCount = areaGoals.filter(g => g.status === 'completed').length

            const goalsWithProgress = areaGoals.filter(
                g => g.target_value && g.target_value > 0
            )
            const averageProgress = goalsWithProgress.length > 0
                ? Math.round(
                    goalsWithProgress.reduce((sum, g) => {
                        return sum + (g.current_value / g.target_value!) * 100
                    }, 0) / goalsWithProgress.length
                )
                : 0

            return {
                areaId: area.id,
                areaName: area.name,
                goalsCount: areaGoals.length,
                completedCount,
                averageProgress,
            }
        }).filter(area => area.goalsCount > 0)
    }, [goals, areas])

    // Статистика по приоритетам
    const priorityStats: PriorityStats = useMemo(() => {
        return {
            high: goals.filter(g => g.priority === 'high' && g.status === 'active').length,
            medium: goals.filter(g => g.priority === 'medium' && g.status === 'active').length,
            low: goals.filter(g => g.priority === 'low' && g.status === 'active').length,
        }
    }, [goals])

    // Ближайшие дедлайны
    const upcomingDeadlines = useMemo(() => {
        const now = new Date()
        return goals
            .filter(g =>
                g.status === 'active' &&
                g.deadline &&
                new Date(g.deadline) > now
            )
            .sort((a, b) =>
                new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()
            )
            .slice(0, 5)
    }, [goals])

    // Просроченные цели
    const overduedGoals = useMemo(() => {
        const now = new Date()
        return goals.filter(
            g => g.status === 'active' &&
                g.deadline &&
                new Date(g.deadline) < now
        )
    }, [goals])

    return {
        stats,
        areaStats,
        priorityStats,
        upcomingDeadlines,
        overduedGoals,
    }
}