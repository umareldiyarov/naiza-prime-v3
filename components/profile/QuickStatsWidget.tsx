'use client'

import { Card } from '@/components/ui/card'
import { Trophy, Brain, Target, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import type { QuickStats } from '@/types/profile'

interface QuickStatsWidgetProps {
    stats: QuickStats | null
}

const statItems = [
    { key: 'wins' as const, label: 'Побед', icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-500/10' },
    { key: 'thoughts' as const, label: 'Мыслей', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-500/10' },
    { key: 'goals' as const, label: 'Целей', icon: Target, color: 'text-blue-600', bg: 'bg-blue-500/10' },

]

export function QuickStatsWidget({ stats }: QuickStatsWidgetProps) {
    if (!stats) return null

    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-lg">📊 Быстрая статистика</h3>
            <div className="grid grid-cols-2 gap-3">
                {statItems.map(({ key, label, icon: Icon, color, bg }, index) => (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                    >
                        <Card className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">{label}</p>
                                    <p className="text-2xl font-bold mt-1">{stats[key]}</p>
                                </div>
                                <div className={`p-3 rounded-xl ${bg}`}>
                                    <Icon className={`w-5 h-5 ${color}`} strokeWidth={2} />
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}