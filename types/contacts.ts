export type ContactCategory = 'work' | 'friend' | 'family' | 'mentor' | 'partner' | 'other'
export type InfluenceType = 'positive' | 'neutral' | 'negative'
export type MoodChange = 'better' | 'same' | 'worse'
export type MoodAfter = 'better' | 'same' | 'worse'

export interface Contact {
    id: string
    user_id: string
    name: string
    category: ContactCategory
    influence_type: InfluenceType
    notes?: string
    created_at: string
    updated_at: string

    // 🆕 ДОБАВЬ ЭТИ ПОЛЯ (вычисляются динамически)
    last_interaction?: string
    interaction_count?: number
}

export interface Interaction {
    id: string
    user_id: string
    contact_id: string
    meeting_date: string
    location?: string
    duration_hours?: number
    mood_before?: 'good' | 'neutral' | 'bad'
    mood_after?: MoodChange
    notes?: string
    created_at: string
}

export interface CreateContactData {
    name: string
    category: ContactCategory
    influence_type: InfluenceType
    notes?: string
}

export interface CreateInteractionData {
    contact_id: string
    meeting_date: string
    location?: string
    duration_hours?: number
    mood_before?: 'good' | 'neutral' | 'bad'
    mood_after?: MoodAfter
    notes?: string
}

// Типы для аналитики
export interface ContactInfluenceScore {
    contact_id: string
    contact_name: string
    category: ContactCategory
    influence_type: InfluenceType

    total_meetings: number
    total_hours_spent: number

    wins_before_avg: number
    wins_after_avg: number
    wins_delta: number

    shadow_cost_goals: number
    mood_improvement_rate: number

    vector_type: 'accelerator' | 'anchor' | 'neutral'
    vector_strength: number
}

export interface ShadowCost {
    hours_spent: number
    potential_goals_completed: number
    percentage_of_week: number
}