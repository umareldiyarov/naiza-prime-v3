'use client'

import { Card } from '@/components/ui/card'
import { Trophy, TrendingUp } from 'lucide-react'
import type { Win } from '@/types/wins'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface WinsStatsProps {
    wins: Win[]
}

export function WinsStats({ wins }: WinsStatsProps) {
    // Подсчёт по размерам
    const small = wins.filter(w => w.size === 'small').length
    const medium = wins.filter(w => w.size === 'medium').length
    const large = wins.filter(w => w.size === 'large').length // 🔧 ИСПРАВЛЕНО

    // Последние 7 дней
    const last7Days = wins.filter(w => {
        const days = Math.floor((Date.now() - new Date(w.created_at).getTime()) / (1000 * 60 * 60 * 24))
        return days <= 7
    }).length

    // График по дням (последние 30 дней)
    const chartData = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        const dateStr = date.toISOString().split('T')[0]

        const count = wins.filter(w => w.created_at.split('T')[0] === dateStr).length

        return {
            date: `${date.getDate()}/${date.getMonth() + 1}`,
            count
        }
    })

    return (
        <div className="space-y-6">
            {/* Общая статистика */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-8 h-8 text-primary" strokeWidth={2} />
                        <div>
                            <p className="text-2xl font-bold">{wins.length}</p>
                            <p className="text-sm text-muted-foreground">Всего побед</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-8 h-8 text-green-600" strokeWidth={2} />
                        <div>
                            <p className="text-2xl font-bold">{last7Days}</p>
                            <p className="text-sm text-muted-foreground">За неделю</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Распределение по размерам */}
            <Card className="p-6">
                <h3 className="font-semibold mb-4">Распределение по размерам</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">🟢 Маленькие</span>
                        <span className="font-semibold">{small}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">🟡 Средние</span>
                        <span className="font-semibold">{medium}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">🔴 Большие</span>
                        <span className="font-semibold">{large}</span>
                    </div>
                </div>
            </Card>

            {/* График */}
            <Card className="p-6">
                <h3 className="font-semibold mb-4">Последние 30 дней</h3>
                <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    )
}