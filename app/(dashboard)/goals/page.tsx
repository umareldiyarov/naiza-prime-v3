'use client'

/**
 * GoalsPage
 * 
 * Страница целей — использует глобальный DataContext
 * Данные загружаются один раз при монтировании Layout
 * Переключение между вкладками мгновенное, без загрузки
 */

import { useData } from '@/contexts/DataContext'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Plus, Target, Calendar } from 'lucide-react'
import { useState, useEffect } from 'react'
import { CreateGoalDialog } from '@/components/goals/CreateGoalDialog'
import { GoalDetailsSheet } from '@/components/goals/GoalDetailsSheet'
import { GoalFilters, type GoalFilterStatus, type GoalSortBy } from '@/components/goals/GoalFilters'
import type { Goal } from '@/types/goals'

/**
 * Определяет статус дедлайна цели
 * @param deadline - дата дедлайна
 * @returns объект с информацией о статусе или null если дедлайн не критичный
 */
const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null

    const now = new Date()
    const deadlineDate = new Date(deadline)
    const diffDays = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return {
        type: 'overdue',
        label: 'Просрочено',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/30'
    }

    if (diffDays === 0) return {
        type: 'today',
        label: 'Сегодня!',
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30'
    }

    if (diffDays <= 3) return {
        type: 'urgent',
        label: `Осталось ${diffDays} ${diffDays === 1 ? 'день' : 'дня'}`,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30'
    }

    if (diffDays <= 7) return {
        type: 'soon',
        label: `Осталось ${diffDays} дней`,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20'
    }

    return null
}

export default function GoalsPage() {
    // Получаем данные из глобального контекста
    const { goals, goalsLoading: loading, refreshGoals } = useData()

    // Состояния для UI
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
    const [filterStatus, setFilterStatus] = useState<GoalFilterStatus>('active')
    const [sortBy, setSortBy] = useState<GoalSortBy>('created')

    // Функция фильтрации
    const filterGoals = (status: GoalFilterStatus) => {
        if (status === 'all') return goals
        return goals.filter(g => g.status === status)
    }

    // Функция сортировки
    const sortGoals = (goalsList: Goal[], sortBy: GoalSortBy) => {
        const sorted = [...goalsList]

        switch (sortBy) {
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 }
                return sorted.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
            case 'progress':
                return sorted.sort((a, b) => {
                    const progressA = a.target_value ? (a.current_value / a.target_value) * 100 : 0
                    const progressB = b.target_value ? (b.current_value / b.target_value) * 100 : 0
                    return progressB - progressA
                })
            case 'deadline':
                return sorted.sort((a, b) => {
                    if (!a.deadline) return 1
                    if (!b.deadline) return -1
                    return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
                })
            case 'created':
            default:
                return sorted.sort((a, b) =>
                    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                )
        }
    }

    // Вычисляемые значения
    const activeGoals = goals.filter(g => g.status === 'active')
    const completedGoals = goals.filter(g => g.status === 'completed')
    const focusGoals = goals.filter(g => g.is_focus && g.status === 'active')

    // Фильтруем и сортируем цели
    const filteredGoals = filterGoals(filterStatus)
    const displayGoals = sortGoals(filteredGoals, sortBy)

    // Синхронизируем выбранную цель с обновлениями из списка
    useEffect(() => {
        if (selectedGoal) {
            const updatedGoal = goals.find(g => g.id === selectedGoal.id)
            if (updatedGoal && updatedGoal.current_value !== selectedGoal.current_value) {
                setSelectedGoal(updatedGoal)
            }
        }
    }, [goals, selectedGoal])

    // Слушаем событие обновления целей
    useEffect(() => {
        const handleGoalsUpdate = () => {
            refreshGoals()
        }
        window.addEventListener('goals-updated', handleGoalsUpdate)
        return () => window.removeEventListener('goals-updated', handleGoalsUpdate)
    }, [refreshGoals])

    // Цвет прогресс-бара
    const getProgressColor = (goal: Goal) => {
        switch (goal.status) {
            case 'completed': return 'bg-green-500'
            case 'active': return 'bg-blue-500'
            case 'paused': return 'bg-yellow-500'
            case 'cancelled': return 'bg-red-500'
            default: return 'bg-primary'
        }
    }

    // Лоадер при загрузке
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-muted-foreground">Загрузка целей...</div>
            </div>
        )
    }

    // Процент завершения
    const completionRate = goals.length > 0
        ? Math.round((completedGoals.length / goals.length) * 100)
        : 0

    const handleGoalClick = (goal: Goal) => {
        setSelectedGoal(goal)
    }

    return (
        <div className="space-y-6 pb-20">
            {/* Заголовок */}
            <div className="space-y-2 px-4 pt-4">
                <div className="flex items-center gap-3">
                    <Target className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold">Цели</h1>
                </div>
                <p className="text-muted-foreground text-sm">
                    Ставьте цели, отслеживайте прогресс и достигайте результатов
                </p>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                    <div className="text-2xl font-bold">{activeGoals.length}</div>
                    <div className="text-xs text-muted-foreground">Активных</div>
                </Card>
                <Card className="p-4">
                    <div className="text-2xl font-bold">{completedGoals.length}</div>
                    <div className="text-xs text-muted-foreground">Выполнено</div>
                </Card>
                <Card className="p-4">
                    <div className="text-2xl font-bold">{completionRate}%</div>
                    <div className="text-xs text-muted-foreground">Процент</div>
                </Card>
            </div>

            {/* Фильтры */}
            <GoalFilters
                status={filterStatus}
                sortBy={sortBy}
                onStatusChange={setFilterStatus}
                onSortChange={setSortBy}
            />

            {/* В фокусе */}
            {focusGoals.length > 0 && filterStatus === 'all' && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" />
                        <h2 className="text-lg font-semibold">В фокусе</h2>
                    </div>
                    <div className="grid gap-3">
                        {focusGoals.map((goal) => (
                            <Card
                                key={goal.id}
                                className="p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                                onClick={() => handleGoalClick(goal)}
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                        <h3 className="font-medium">{goal.title}</h3>
                                        {goal.description && (
                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                {goal.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            {goal.current_value} / {goal.target_value} {goal.unit}
                                        </span>
                                        <span className="font-medium">
                                            {goal.target_value
                                                ? Math.round((goal.current_value / goal.target_value) * 100)
                                                : 0}%
                                        </span>
                                    </div>
                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            style={{
                                                width: `${goal.target_value
                                                    ? Math.min((goal.current_value / goal.target_value) * 100, 100)
                                                    : 0}%`
                                            }}
                                            className={`h-full ${getProgressColor(goal)} transition-all duration-500`}
                                        />
                                    </div>
                                </div>
                                {goal.deadline && (
                                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                        <Calendar className="w-3 h-3" />
                                        {new Date(goal.deadline).toLocaleDateString('ru-RU')}
                                    </div>
                                )}
                            </Card>
                        ))}
                    </div>
                </div>
            )}

            {/* Все цели */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        {filterStatus === 'all' ? 'Все цели' :
                            filterStatus === 'active' ? 'Активные цели' :
                                filterStatus === 'completed' ? 'Завершённые цели' :
                                    filterStatus === 'paused' ? 'На паузе' : 'Отменённые'}
                    </h2>
                    <span className="text-sm text-muted-foreground">
                        {displayGoals.length}
                    </span>
                </div>

                {displayGoals.length === 0 ? (
                    <Card className="p-8 text-center">
                        <Target className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                        <p className="text-muted-foreground mb-4">
                            {filterStatus === 'all'
                                ? 'Создайте свою первую цель!'
                                : 'Нет целей с таким статусом'}
                        </p>
                        {filterStatus === 'all' && (
                            <Button onClick={() => setShowCreateDialog(true)}>
                                <Plus className="w-4 h-4 mr-2" />
                                Создать цель
                            </Button>
                        )}
                    </Card>
                ) : (
                    <div className="grid gap-3">
                        {displayGoals.map((goal) => {
                            const deadlineStatus = getDeadlineStatus(goal.deadline)

                            return (
                                <Card
                                    key={goal.id}
                                    className={`p-4 cursor-pointer hover:bg-accent/50 transition-colors ${deadlineStatus ? `border-2 ${deadlineStatus.borderColor}` : ''}`}
                                    onClick={() => handleGoalClick(goal)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-medium">{goal.title}</h3>
                                            {goal.description && (
                                                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                                    {goal.description}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 ml-2">
                                            {goal.priority === 'high' && (
                                                <span className="text-xs bg-red-500/10 text-red-500 px-2 py-1 rounded">
                                                    Высокий
                                                </span>
                                            )}
                                            {goal.priority === 'medium' && (
                                                <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded">
                                                    Средний
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                {goal.current_value} / {goal.target_value} {goal.unit}
                                            </span>
                                            <span className="font-medium">
                                                {goal.target_value
                                                    ? Math.round((goal.current_value / goal.target_value) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                style={{
                                                    width: `${goal.target_value
                                                        ? Math.min((goal.current_value / goal.target_value) * 100, 100)
                                                        : 0}%`
                                                }}
                                                className={`h-full ${getProgressColor(goal)} transition-all duration-500`}
                                            />
                                        </div>
                                    </div>

                                    {goal.deadline && (
                                        <div className={`flex items-center justify-between mt-2 text-xs ${deadlineStatus ? `${deadlineStatus.bgColor} px-2 py-1.5 rounded-lg -mx-1` : ''}`}>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className={`w-3.5 h-3.5 ${deadlineStatus?.color || 'text-muted-foreground'}`} />
                                                <span className={deadlineStatus?.color || 'text-muted-foreground'}>
                                                    {new Date(goal.deadline).toLocaleDateString('ru-RU')}
                                                </span>
                                            </div>
                                            {deadlineStatus && (
                                                <span className={`font-medium ${deadlineStatus.color}`}>
                                                    {deadlineStatus.label}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </Card>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* FAB */}
            <Button
                size="lg"
                className="fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg"
                onClick={() => setShowCreateDialog(true)}
            >
                <Plus className="w-6 h-6" />
            </Button>

            <CreateGoalDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
            />

            <GoalDetailsSheet
                goal={selectedGoal}
                open={!!selectedGoal}
                onOpenChange={(open) => {
                    if (!open) {
                        setSelectedGoal(null)
                        refreshGoals()
                    }
                }}
                onGoalUpdate={(updatedGoal) => {
                    setSelectedGoal(updatedGoal)
                }}
            />
        </div>
    )
}