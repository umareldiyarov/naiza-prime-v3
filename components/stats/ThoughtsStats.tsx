'use client'

import { Card } from '@/components/ui/card'
import { Brain, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { Thought } from '@/types/thoughts'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface ThoughtsStatsProps {
    thoughts: Thought[]
}

export function ThoughtsStats({ thoughts }: ThoughtsStatsProps) {
    const good = thoughts.filter(t => t.mood === 'good').length
    const neutral = thoughts.filter(t => t.mood === 'neutral').length
    const bad = thoughts.filter(t => t.mood === 'bad').length

    // Тренд (последние 7 дней vs предыдущие 7)
    const last7 = thoughts.filter(t => {
        const days = Math.floor((Date.now() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24))
        return days <= 7
    })
    const prev7 = thoughts.filter(t => {
        const days = Math.floor((Date.now() - new Date(t.created_at).getTime()) / (1000 * 60 * 60 * 24))
        return days > 7 && days <= 14
    })

    const last7Good = last7.filter(t => t.mood === 'good').length
    const prev7Good = prev7.filter(t => t.mood === 'good').length

    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (last7Good > prev7Good) trend = 'up'
    if (last7Good < prev7Good) trend = 'down'

    // График настроения (последние 30 дней)
    const chartData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        const dateStr = date.toISOString().split('T')[0]

        const dayThoughts = thoughts.filter(t => t.created_at.split('T')[0] === dateStr)
        const goodCount = dayThoughts.filter(t => t.mood === 'good').length
        const totalCount = dayThoughts.length

        return {
            date: `${date.getDate()}/${date.getMonth() + 1}`,
            mood: totalCount > 0 ? (goodCount / totalCount) * 100 : 50
        }
    })

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <Brain className="w-8 h-8 text-primary" strokeWidth={2} />
                        <div>
                            <p className="text-2xl font-bold">{thoughts.length}</p>
                            <p className="text-sm text-muted-foreground">Всего мыслей</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        {trend === 'up' && <TrendingUp className="w-8 h-8 text-green-600" strokeWidth={2} />}
                        {trend === 'down' && <TrendingDown className="w-8 h-8 text-red-600" strokeWidth={2} />}
                        {trend === 'stable' && <Minus className="w-8 h-8 text-blue-600" strokeWidth={2} />}
                        <div>
                            <p className="text-lg font-bold">
                                {trend === 'up' && '📈 Улучшается'}
                                {trend === 'down' && '📉 Ухудшается'}
                                {trend === 'stable' && '➡️ Стабильно'}
                            </p>
                            <p className="text-sm text-muted-foreground">Тренд настроения</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="p-6">
                <h3 className="font-semibold mb-4">Распределение настроения</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">😊 Хорошее</span>
                        <span className="font-semibold text-green-600">{good}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">😐 Нейтральное</span>
                        <span className="font-semibold text-blue-600">{neutral}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">😔 Плохое</span>
                        <span className="font-semibold text-red-600">{bad}</span>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <h3 className="font-semibold mb-4">Динамика настроения (30 дней)</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={chartData}>
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} domain={[0, 100]} />
                        <Tooltip />
                        <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} />
                    </LineChart>
                </ResponsiveContainer>
            </Card>
        </div>
    )
}