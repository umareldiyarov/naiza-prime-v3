'use client'

import { Card } from '@/components/ui/card'
import { Target, TrendingUp, CheckCircle2, Pause, XCircle, Activity, AlertCircle, Calendar } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import type { GoalStats, AreaStats, PriorityStats } from '@/types/stats'
import type { Goal } from '@/types/goals'

interface GoalsStatsProps {
    stats: GoalStats
    areaStats: AreaStats[]
    priorityStats: PriorityStats
    upcomingDeadlines: Goal[]
    overduedGoals: Goal[]
}

export function GoalsStats({
    stats,
    areaStats,
    priorityStats,
    upcomingDeadlines,
    overduedGoals
}: GoalsStatsProps) {
    // График по сферам жизни
    const areaChartData = areaStats.map(area => ({
        name: area.areaName,
        value: area.goalsCount,
    }))

    // Данные для круговой диаграммы статусов
    const statusPieData = [
        { name: 'Активные', value: stats.activeGoals, color: '#10b981' },
        { name: 'Завершённые', value: stats.completedGoals, color: '#3b82f6' },
        { name: 'На паузе', value: stats.pausedGoals, color: '#f59e0b' },
        { name: 'Отменённые', value: stats.cancelledGoals, color: '#ef4444' },
    ].filter(item => item.value > 0)

    return (
        <div className="space-y-6">
            {/* Основные метрики */}
            <div className="grid grid-cols-2 gap-3">
                <Card className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Target className="w-4 h-4 text-blue-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">{stats.totalGoals}</div>
                    <div className="text-xs text-muted-foreground mt-1">Всего целей</div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <Activity className="w-4 h-4 text-green-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">{stats.activeGoals}</div>
                    <div className="text-xs text-muted-foreground mt-1">Активных</div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">{stats.completedGoals}</div>
                    <div className="text-xs text-muted-foreground mt-1">Завершено</div>
                </Card>

                <Card className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <TrendingUp className="w-4 h-4 text-purple-500" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold">{stats.completionRate}%</div>
                    <div className="text-xs text-muted-foreground mt-1">Выполнение</div>
                </Card>
            </div>

            {/* Прогресс и достижения за период */}
            <Card className="p-6">
                <h3 className="font-semibold mb-4">Достижения</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">📅 За этот месяц</span>
                        <span className="font-semibold text-green-600">
                            {stats.goalsCompletedThisMonth} целей
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">📊 За эту неделю</span>
                        <span className="font-semibold text-blue-600">
                            {stats.goalsCompletedThisWeek} целей
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">📈 Средний прогресс</span>
                        <span className="font-semibold">{stats.averageProgress}%</span>
                    </div>
                </div>
            </Card>

            {/* Распределение по приоритетам */}
            <Card className="p-6">
                <h3 className="font-semibold mb-4">Активные цели по приоритету</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">🔥 Высокий</span>
                        <span className="font-semibold text-orange-500">{priorityStats.high}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">⚡ Средний</span>
                        <span className="font-semibold text-blue-500">{priorityStats.medium}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">⭐ Низкий</span>
                        <span className="font-semibold text-gray-500">{priorityStats.low}</span>
                    </div>
                </div>
            </Card>

            {/* График по сферам жизни */}
            {areaChartData.length > 0 && (
                <Card className="p-6">
                    <h3 className="font-semibold mb-4">Цели по сферам жизни</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={areaChartData}>
                            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            )}

            {/* Круговая диаграмма статусов */}
            {statusPieData.length > 0 && (
                <Card className="p-6">
                    <h3 className="font-semibold mb-4">Распределение по статусам</h3>
                    <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                            <Pie
                                data={statusPieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {statusPieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {statusPieData.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-muted-foreground">{item.name}</span>
                                <span className="font-semibold ml-auto">{item.value}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Просроченные цели */}
            {overduedGoals.length > 0 && (
                <Card className="p-6 border-red-500/20">
                    <div className="flex items-center gap-2 mb-4">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <h3 className="font-semibold text-red-500">
                            Просроченные цели ({overduedGoals.length})
                        </h3>
                    </div>
                    <div className="space-y-2">
                        {overduedGoals.slice(0, 3).map((goal) => (
                            <div key={goal.id} className="text-sm">
                                <p className="font-medium">{goal.title}</p>
                                <p className="text-xs text-muted-foreground">
                                    Дедлайн: {new Date(goal.deadline!).toLocaleDateString('ru-RU')}
                                </p>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Ближайшие дедлайны */}
            {upcomingDeadlines.length > 0 && (
                <Card className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Ближайшие дедлайны</h3>
                    </div>
                    <div className="space-y-3">
                        {upcomingDeadlines.map((goal) => (
                            <div key={goal.id} className="flex items-start justify-between">
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{goal.title}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {new Date(goal.deadline!).toLocaleDateString('ru-RU')}
                                    </p>
                                </div>
                                <div className="text-xs font-medium text-primary">
                                    {Math.ceil((new Date(goal.deadline!).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} дней
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    )
}