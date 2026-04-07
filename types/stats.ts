export interface GoalStats {
    totalGoals: number
    activeGoals: number
    completedGoals: number
    pausedGoals: number
    cancelledGoals: number
    completionRate: number
    averageProgress: number
    goalsCompletedThisMonth: number
    goalsCompletedThisWeek: number
    totalProgress: number
}

export interface AreaStats {
    areaId: string
    areaName: string
    goalsCount: number
    completedCount: number
    averageProgress: number
}

export interface PriorityStats {
    high: number
    medium: number
    low: number
}

export interface ProgressHistory {
    date: string
    value: number
    goalId: string
    goalTitle: string
}