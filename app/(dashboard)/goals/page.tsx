'use client'

import { useState } from 'react'
import { useGoals } from '@/hooks/useGoals'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Calendar, Loader2, Check, Clock, Pause, Plus, X } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogBody
} from '@/components/ui/dialog'
import type { GoalStatus } from '@/types/goals'

const statusConfig = {
    active: { label: 'В процессе', icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
    completed: { label: 'Достигнуто', icon: Check, color: 'text-green-600', bgColor: 'bg-green-500/10' },
    postponed: { label: 'Отложено', icon: Pause, color: 'text-orange-600', bgColor: 'bg-orange-500/10' }
}

export default function GoalsPage() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [deadline, setDeadline] = useState('')
    const [showHistory, setShowHistory] = useState(false)
    const [showAddForm, setShowAddForm] = useState(false)
    const { goals, loading, loadGoals, addGoal, updateGoal } = useGoals()
    const [submitting, setSubmitting] = useState(false)

    const handleAddGoal = async () => {
        if (!title.trim()) return

        setSubmitting(true)
        const { error } = await addGoal({
            title: title.trim(),
            description: description.trim() || undefined,
            deadline: deadline || undefined
        })

        if (!error) {
            setTitle('')
            setDescription('')
            setDeadline('')
            setShowAddForm(false)
        }
        setSubmitting(false)
    }

    const handleOpenHistory = async () => {
        if (goals.length === 0) {
            await loadGoals()
        }
        setShowHistory(true)
    }

    const handleStatusChange = async (goalId: string, newStatus: GoalStatus) => {
        await updateGoal(goalId, { status: newStatus })
    }

    const getDaysLeft = (deadline?: string) => {
        if (!deadline) return null
        const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        return days
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    return (
        <>
            <div className="min-h-screen p-6 pb-32">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-2xl mx-auto space-y-6"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <Target className="w-8 h-8 text-primary" strokeWidth={2} />
                                <h1 className="text-3xl font-bold tracking-tight">Цели</h1>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Определите и достигайте свои цели
                            </p>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleOpenHistory}
                            className="px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-xl transition-colors"
                        >
                            История
                        </motion.button>
                    </div>

                    {/* Add Button / Form */}
                    <AnimatePresence mode="wait">
                        {!showAddForm ? (
                            <motion.div
                                key="add-button"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <Card
                                    onClick={() => setShowAddForm(true)}
                                    className="p-6 cursor-pointer hover:shadow-lg transition-all border-dashed border-2 border-primary/30 hover:border-primary/50"
                                >
                                    <div className="flex items-center justify-center gap-3 text-primary">
                                        <Plus className="w-5 h-5" strokeWidth={2} />
                                        <span className="font-medium">Добавить новую цель</span>
                                    </div>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="add-form"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <Card className="overflow-hidden border-primary/20">
                                    <div className="p-6 space-y-4">
                                        {/* Title */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Название цели *
                                            </label>
                                            <input
                                                type="text"
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="Например: Выучить TypeScript"
                                                className="w-full p-3 rounded-xl border-0 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 text-base transition-all"
                                            />
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Описание (опционально)
                                            </label>
                                            <textarea
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Почему эта цель важна для вас?"
                                                className="w-full min-h-[100px] p-3 rounded-xl border-0 bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-base transition-all"
                                            />
                                        </div>

                                        {/* Deadline */}
                                        <div>
                                            <label className="block text-sm font-medium mb-2">
                                                Дедлайн (опционально)
                                            </label>
                                            <input
                                                type="date"
                                                value={deadline}
                                                onChange={(e) => setDeadline(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full p-3 rounded-xl border-0 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20 text-base transition-all"
                                            />
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-2">
                                            <Button
                                                variant="ghost"
                                                onClick={() => {
                                                    setShowAddForm(false)
                                                    setTitle('')
                                                    setDescription('')
                                                    setDeadline('')
                                                }}
                                                className="rounded-xl"
                                            >
                                                Отмена
                                            </Button>
                                            <Button
                                                onClick={handleAddGoal}
                                                disabled={submitting || !title.trim()}
                                                className="rounded-xl px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                                            >
                                                {submitting ? (
                                                    <span className="flex items-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Сохранение...
                                                    </span>
                                                ) : (
                                                    'Создать цель'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>

            {/* History Modal */}
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogContent>
                    <DialogHeader onClose={() => setShowHistory(false)}>
                        <div>
                            <DialogTitle>Мои цели</DialogTitle>
                            <DialogDescription>
                                Все ваши цели и их статус
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <DialogBody>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : goals.length === 0 ? (
                            <div className="text-center py-12">
                                <Target className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" strokeWidth={1.5} />
                                <p className="text-muted-foreground">
                                    Целей пока нет. Создайте первую цель.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {goals.map((goal, index) => {
                                    const statusInfo = statusConfig[goal.status]
                                    const StatusIcon = statusInfo.icon
                                    const daysLeft = getDaysLeft(goal.deadline)

                                    return (
                                        <motion.div
                                            key={goal.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                        >
                                            <Card className="p-5 hover:shadow-lg transition-all group border-border/50">
                                                <div className="space-y-3">
                                                    {/* Header */}
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex-1">
                                                            <h3 className="font-semibold text-base leading-tight">
                                                                {goal.title}
                                                            </h3>
                                                            {goal.description && (
                                                                <p className="text-sm text-muted-foreground mt-1">
                                                                    {goal.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${statusInfo.bgColor} shrink-0`}>
                                                            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} strokeWidth={2} />
                                                            <span className={`text-xs font-medium ${statusInfo.color}`}>
                                                                {statusInfo.label}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                        <div className="flex items-center gap-4">
                                                            {goal.deadline && (
                                                                <div className="flex items-center gap-1.5">
                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                    <span>{formatDate(goal.deadline)}</span>
                                                                    {daysLeft !== null && goal.status === 'active' && (
                                                                        <span className={`ml-1 ${daysLeft < 7 ? 'text-orange-600 font-medium' : ''}`}>
                                                                            ({daysLeft > 0 ? `${daysLeft} дн.` : 'Просрочено'})
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Status Change Buttons */}
                                                        {goal.status !== 'completed' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleStatusChange(goal.id, 'completed')}
                                                                className="h-7 px-3 text-xs hover:bg-green-500/10 hover:text-green-600"
                                                            >
                                                                <Check className="w-3.5 h-3.5 mr-1" />
                                                                Выполнено
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    )
                                })}
                            </div>
                        )}
                    </DialogBody>
                </DialogContent>
            </Dialog>
        </>
    )
}