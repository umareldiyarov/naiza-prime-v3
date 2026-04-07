export type GoalType = 'outcome' | 'process' | 'milestone'
export type GoalMetricType = 'numeric' | 'checklist' | 'boolean'
export type GoalPriority = 'high' | 'medium' | 'low'
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled'

export interface LifeArea {
    id: string
    user_id: string
    name: string
    icon?: string
    color?: string
    order_index: number
    created_at: string
}

export interface Goal {
    id: string
    user_id: string

    // Основное
    title: string
    description?: string
    vision?: string
    why?: string

    // Тип и категория
    type: GoalType
    area_id?: string
    area?: LifeArea

    // Метрика
    metric_type: GoalMetricType
    current_value: number
    target_value?: number
    unit?: string

    // Время
    start_date: string
    deadline?: string

    // Статус
    priority: GoalPriority
    status: GoalStatus
    is_focus?: boolean  // ⬅️ ДОБАВЬ ЭТУ СТРОКУ

    // Аналитика
    momentum: number
    health: number

    created_at: string
    updated_at: string

    // Связи
    milestones?: Milestone[]
    wins_count?: number
}

export interface Milestone {
    id: string
    goal_id: string
    title: string
    target_value?: number
    current_value: number
    completed: boolean
    deadline?: string
    order_index: number
    created_at: string
}

export interface GoalWin {
    goal_id: string
    win_id: string
    value_added: number
    created_at: string
}

export interface CreateGoalInput {
    title: string
    description?: string
    why?: string
    type: GoalType
    area_id?: string
    metric_type?: GoalMetricType
    target_value?: number
    unit?: string
    deadline?: string
    priority?: GoalPriority
    is_focus?: boolean  // ⬅️ И ДОБАВЬ СЮДА
}

export interface UpdateGoalInput {
    title?: string
    description?: string
    vision?: string
    why?: string
    type?: GoalType
    area_id?: string
    current_value?: number
    target_value?: number
    unit?: string
    deadline?: string
    priority?: GoalPriority
    status?: GoalStatus
    is_focus?: boolean  // ⬅️ И СЮДА
}