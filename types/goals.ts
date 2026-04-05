export type GoalStatus = 'active' | 'completed' | 'postponed'

export interface Goal {
    id: string
    user_id: string
    title: string
    description?: string
    deadline?: string
    status: GoalStatus
    created_at: string
    completed_at?: string
    updated_at: string
}

export interface CreateGoalData {
    title: string
    description?: string
    deadline?: string
}

export interface UpdateGoalData {
    title?: string
    description?: string
    deadline?: string
    status?: GoalStatus
    completed_at?: string
}