'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, Circle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface Goal {
    id: string
    title: string
    completed: boolean
}

export function GoalsProgressWidget() {
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        loadGoals()
    }, [])

    const loadGoals = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data } = await supabase
                .from('goals')
                .select('id, title, completed')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(5)

            setGoals(data || [])
        } catch (error) {
            console.error('Error loading goals:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <Card className="p-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </Card>
        )
    }

    if (goals.length === 0) {
        return (
            <Card className="p-6 text-center text-muted-foreground">
                <p className="text-sm">Целей пока нет</p>
            </Card>
        )
    }

    const completedCount = goals.filter(g => g.completed).length
    const percentage = Math.round((completedCount / goals.length) * 100)

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">🎯 Прогресс целей</h3>
                <span className="text-sm text-muted-foreground">
                    {completedCount} / {goals.length}
                </span>
            </div>

            <Card className="p-5">
                {/* Прогресс бар */}
                <div className="mb-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Выполнено</span>
                        <span className="font-semibold">{percentage}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percentage}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-primary to-primary/80"
                        />
                    </div>
                </div>

                {/* Список целей */}
                <div className="space-y-2">
                    {goals.map((goal, index) => (
                        <motion.div
                            key={goal.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-center gap-2"
                        >
                            {goal.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" strokeWidth={2} />
                            ) : (
                                <Circle className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={2} />
                            )}
                            <span className={`text-sm line-clamp-1 ${goal.completed ? 'text-muted-foreground line-through' : ''}`}>
                                {goal.title}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </Card>
        </div>
    )
}