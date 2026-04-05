export type ThoughtMood = 'good' | 'neutral' | 'bad'

export interface Thought {
    id: string
    user_id: string
    content: string
    mood: ThoughtMood
    created_at: string
}

export interface CreateThoughtData {
    content: string
    mood: ThoughtMood
}