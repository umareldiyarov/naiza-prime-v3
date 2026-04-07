'use client'

import { useState, useEffect } from 'react'
import { useGoals } from '@/hooks/useGoals'
import { useWins } from '@/hooks/useWins'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import {
    Calendar,
    Trash2,
    Edit2,
    Plus,
    Check,
    X,
    Trophy,
    Loader2
} from 'lucide-react'
import type { Goal, GoalPriority, GoalStatus } from '@/types/goals'
import type { Win } from '@/types/wins'

interface GoalDetailsSheetProps {
    goal: Goal | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onGoalUpdate?: (goal: Goal) => void
}

const winSizeConfig = {
    small: { label: 'Маленькая', emoji: '🟢', color: 'bg-green-500/10 text-green-600' },
    medium: { label: 'Средняя', emoji: '🟡', color: 'bg-yellow-500/10 text-yellow-600' },
    large: { label: 'Большая', emoji: '🔴', color: 'bg-red-500/10 text-red-600' }
}

export function GoalDetailsSheet({ goal, open, onOpenChange, onGoalUpdate }: GoalDetailsSheetProps) {
    const { updateGoal, updateProgress, deleteGoal } = useGoals()
    const { loadWinsByGoal } = useWins()
    const [isEditing, setIsEditing] = useState(false)
    const [progressInput, setProgressInput] = useState('')
    const [relatedWins, setRelatedWins] = useState<Win[]>([])
    const [loadingWins, setLoadingWins] = useState(false)
    const [editData, setEditData] = useState({
        title: '',
        description: '',
        target_value: '',
        deadline: '',
        priority: 'medium' as GoalPriority,
        status: 'active' as GoalStatus,
    })

    // Синхронизация данных при открытии
    useEffect(() => {
        if (goal && open) {
            setEditData({
                title: goal.title,
                description: goal.description || '',
                target_value: goal.target_value?.toString() || '',
                deadline: goal.deadline || '',
                priority: goal.priority,
                status: goal.status,
            })
            setIsEditing(false)
            setProgressInput('')

            // Загружаем связанные победы
            const fetchWins = async () => {
                setLoadingWins(true)
                const { data } = await loadWinsByGoal(goal.id)
                setRelatedWins(data || [])
                setLoadingWins(false)
            }
            fetchWins()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [goal?.id, open])

    if (!goal) return null

    const handleEdit = () => {
        setEditData({
            title: goal.title,
            description: goal.description || '',
            target_value: goal.target_value?.toString() || '',
            deadline: goal.deadline || '',
            priority: goal.priority,
            status: goal.status,
        })
        setIsEditing(true)
    }

    const handleSave = async () => {
        try {
            const updated = await updateGoal(goal.id, {
                title: editData.title,
                description: editData.description || undefined,
                target_value: editData.target_value ? Number(editData.target_value) : undefined,
                deadline: editData.deadline || undefined,
                priority: editData.priority,
                status: editData.status,
            })
            if (updated && onGoalUpdate) {
                onGoalUpdate(updated)
            }
            setIsEditing(false)
        } catch (error) {
            console.error('Error updating goal:', error)
        }
    }

    const handleUpdateProgress = async () => {
        if (!progressInput.trim() || Number(progressInput) === 0) return

        if (goal.target_value && goal.current_value >= goal.target_value) {
            alert('🎉 Цель уже достигнута! Можете отметить её как завершённую.')
            setProgressInput('')
            return
        }

        try {
            const increment = Number(progressInput)
            const updatedGoal = await updateProgress(goal.id, increment)

            if (updatedGoal && onGoalUpdate) {
                onGoalUpdate(updatedGoal)

                if (updatedGoal.current_value >= updatedGoal.target_value!) {
                    setTimeout(() => {
                        alert('🎉 Поздравляем! Цель достигнута!')
                    }, 300)
                }
            }

            setProgressInput('')
        } catch (error) {
            console.error('Error updating progress:', error)
        }
    }

    const handleDelete = async () => {
        if (!confirm('Удалить эту цель?')) return
        try {
            await deleteGoal(goal.id)
            onOpenChange(false)
        } catch (error) {
            console.error('Error deleting goal:', error)
        }
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const progress = goal.target_value && goal.target_value > 0
        ? Math.round((goal.current_value / goal.target_value) * 100)
        : 0

    const priorityColors = {
        high: 'bg-orange-500',
        medium: 'bg-blue-500',
        low: 'bg-gray-500',
    }

    const priorityTextColors = {
        high: 'text-orange-500',
        medium: 'text-blue-500',
        low: 'text-gray-500',
    }

    const statusLabels = {
        active: '🟢 Активна',
        completed: '✅ Завершена',
        paused: '⏸️ На паузе',
        cancelled: '❌ Отменена',
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[90vh] overflow-y-auto">
                <SheetHeader className="mb-6 pr-12">
                    <div className="flex items-start justify-between gap-4">
                        <SheetTitle className="text-xl flex-1 pr-2 line-clamp-2">
                            {isEditing ? 'Редактирование цели' : goal.title}
                        </SheetTitle>
                        {!isEditing && (
                            <div className="flex gap-2 flex-shrink-0">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleEdit}
                                    className="h-9 w-9"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={handleDelete}
                                    className="h-9 w-9"
                                >
                                    <Trash2 className="w-4 h-4 text-red-500" />
                                </Button>
                            </div>
                        )}
                    </div>
                </SheetHeader>

                <div className="space-y-6 pb-6">
                    {isEditing ? (
                        /* РЕЖИМ РЕДАКТИРОВАНИЯ */
                        <div className="space-y-4">
                            <div>
                                <Label>Название</Label>
                                <Input
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <Label>Зачем эта цель для тебя важна?</Label>
                                <Textarea
                                    value={editData.description}
                                    onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                    placeholder="Например: Помочь родителям купить квартиру"
                                    rows={3}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Целевое значение</Label>
                                    <Input
                                        type="number"
                                        value={editData.target_value}
                                        onChange={(e) => setEditData({ ...editData, target_value: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Дедлайн</Label>
                                    <Input
                                        type="date"
                                        value={editData.deadline}
                                        onChange={(e) => setEditData({ ...editData, deadline: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Приоритет</Label>
                                    <Select
                                        value={editData.priority}
                                        onValueChange={(value: GoalPriority) => setEditData({ ...editData, priority: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="high">🔥 Высокий</SelectItem>
                                            <SelectItem value="medium">⚡ Средний</SelectItem>
                                            <SelectItem value="low">⭐ Низкий</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label>Статус</Label>
                                    <Select
                                        value={editData.status}
                                        onValueChange={(value: GoalStatus) => setEditData({ ...editData, status: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="active">🟢 Активна</SelectItem>
                                            <SelectItem value="completed">✅ Завершена</SelectItem>
                                            <SelectItem value="paused">⏸️ На паузе</SelectItem>
                                            <SelectItem value="cancelled">❌ Отменена</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" className="flex-1" onClick={() => setIsEditing(false)}>
                                    <X className="w-4 h-4 mr-2" />
                                    Отмена
                                </Button>
                                <Button className="flex-1" onClick={handleSave}>
                                    <Check className="w-4 h-4 mr-2" />
                                    Сохранить
                                </Button>
                            </div>
                        </div>
                    ) : (
                        /* РЕЖИМ ПРОСМОТРА */
                        <>
                            {/* Progress Section */}
                            {goal.target_value && goal.target_value > 0 && (
                                <Card className="p-4">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <div className="text-3xl font-bold">
                                                {goal.current_value} / {goal.target_value}
                                                <span className="text-lg text-muted-foreground ml-2">{goal.unit}</span>
                                            </div>
                                            <div className="text-2xl font-bold">{progress}%</div>
                                        </div>

                                        <div className="h-3 bg-secondary rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all ${priorityColors[goal.priority]}`}
                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                            />
                                        </div>

                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                placeholder={
                                                    goal.current_value >= goal.target_value
                                                        ? "Цель достигнута!"
                                                        : "Добавить прогресс"
                                                }
                                                value={progressInput}
                                                onChange={(e) => setProgressInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdateProgress()}
                                                disabled={goal.current_value >= goal.target_value}
                                            />
                                            <Button
                                                onClick={handleUpdateProgress}
                                                disabled={!progressInput.trim() || goal.current_value >= goal.target_value}
                                            >
                                                {goal.current_value >= goal.target_value ? (
                                                    <Check className="w-4 h-4" />
                                                ) : (
                                                    <Plus className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )}

                            {/* Info Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="p-4">
                                    <div className="text-xs text-muted-foreground mb-1">Приоритет</div>
                                    <div className={`font-medium ${priorityTextColors[goal.priority]}`}>
                                        {goal.priority === 'high' ? '🔥 Высокий' :
                                            goal.priority === 'medium' ? '⚡ Средний' : '⭐ Низкий'}
                                    </div>
                                </Card>

                                <Card className="p-4">
                                    <div className="text-xs text-muted-foreground mb-1">Статус</div>
                                    <div className="font-medium">{statusLabels[goal.status]}</div>
                                </Card>

                                {goal.deadline && (
                                    <Card className="p-4">
                                        <div className="text-xs text-muted-foreground mb-1">Дедлайн</div>
                                        <div className="font-medium flex items-center gap-2">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(goal.deadline).toLocaleDateString('ru-RU')}
                                        </div>
                                    </Card>
                                )}

                                <Card className="p-4">
                                    <div className="text-xs text-muted-foreground mb-1">Побед</div>
                                    <div className="font-medium flex items-center gap-2">
                                        <Trophy className="w-4 h-4" />
                                        {relatedWins.length}
                                    </div>
                                </Card>
                            </div>

                            {/* Связанные победы */}
                            {loadingWins ? (
                                <Card className="p-4">
                                    <div className="flex items-center justify-center py-6">
                                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                                    </div>
                                </Card>
                            ) : relatedWins.length > 0 && (
                                <Card className="p-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Trophy className="w-5 h-5 text-primary" />
                                        <h3 className="font-semibold">Связанные победы ({relatedWins.length})</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {relatedWins.map((win) => {
                                            const sizeConfig = winSizeConfig[win.size]
                                            return (
                                                <div
                                                    key={win.id}
                                                    className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                                                >
                                                    <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${sizeConfig.color} flex-shrink-0`}>
                                                        <span className="text-base">{sizeConfig.emoji}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm">{win.title}</p>
                                                        {win.description && (
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                                                {win.description}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                                            <span>{formatDate(win.created_at)}</span>
                                                            <span className="text-muted-foreground/50">•</span>
                                                            <span className={sizeConfig.color}>{sizeConfig.label}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </Card>
                            )}

                            {/* Зачем эта цель важна */}
                            {goal.description && (
                                <Card className="p-4">
                                    <h3 className="font-semibold mb-2">Зачем эта цель важна</h3>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{goal.description}</p>
                                </Card>
                            )}

                            {/* Quick Actions */}
                            {!isEditing && (
                                <div className="grid grid-cols-2 gap-3 pt-4">
                                    {goal.status === 'active' && (
                                        <>
                                            <Button
                                                onClick={async () => {
                                                    try {
                                                        await updateGoal(goal.id, { status: 'paused' })
                                                        const updated = { ...goal, status: 'paused' as const }
                                                        if (onGoalUpdate) onGoalUpdate(updated)
                                                        window.dispatchEvent(new Event('goals-updated'))
                                                    } catch (error) {
                                                        console.error('Error:', error)
                                                    }
                                                }}
                                                variant="outline"
                                                className="w-full"
                                            >
                                                ⏸️ Пауза
                                            </Button>
                                            <Button
                                                onClick={async () => {
                                                    try {
                                                        await updateGoal(goal.id, {
                                                            status: 'completed',
                                                            current_value: goal.target_value || goal.current_value
                                                        })
                                                        const updated = {
                                                            ...goal,
                                                            status: 'completed' as const,
                                                            current_value: goal.target_value || goal.current_value
                                                        }
                                                        if (onGoalUpdate) onGoalUpdate(updated)
                                                        window.dispatchEvent(new Event('goals-updated'))
                                                    } catch (error) {
                                                        console.error('Error:', error)
                                                    }
                                                }}
                                                variant="default"
                                                className="w-full"
                                            >
                                                ✅ Завершить
                                            </Button>
                                        </>
                                    )}

                                    {goal.status === 'paused' && (
                                        <>
                                            <Button
                                                onClick={async () => {
                                                    try {
                                                        await updateGoal(goal.id, { status: 'active' })
                                                        const updated = { ...goal, status: 'active' as const }
                                                        if (onGoalUpdate) onGoalUpdate(updated)
                                                        window.dispatchEvent(new Event('goals-updated'))
                                                    } catch (error) {
                                                        console.error('Error:', error)
                                                    }
                                                }}
                                                variant="default"
                                                className="w-full"
                                            >
                                                ▶️ Продолжить
                                            </Button>
                                            <Button
                                                onClick={async () => {
                                                    if (confirm('Отменить цель?')) {
                                                        try {
                                                            await updateGoal(goal.id, { status: 'cancelled' })
                                                            const updated = { ...goal, status: 'cancelled' as const }
                                                            if (onGoalUpdate) onGoalUpdate(updated)
                                                            window.dispatchEvent(new Event('goals-updated'))
                                                        } catch (error) {
                                                            console.error('Error:', error)
                                                        }
                                                    }
                                                }}
                                                variant="destructive"
                                                className="w-full"
                                            >
                                                ❌ Отменить
                                            </Button>
                                        </>
                                    )}

                                    {(goal.status === 'completed' || goal.status === 'cancelled') && (
                                        <Button
                                            onClick={async () => {
                                                try {
                                                    await updateGoal(goal.id, { status: 'active' })
                                                    const updated = { ...goal, status: 'active' as const }
                                                    if (onGoalUpdate) onGoalUpdate(updated)
                                                    window.dispatchEvent(new Event('goals-updated'))
                                                } catch (error) {
                                                    console.error('Error:', error)
                                                }
                                            }}
                                            variant="outline"
                                            className="w-full col-span-2"
                                        >
                                            🔄 Возобновить
                                        </Button>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}