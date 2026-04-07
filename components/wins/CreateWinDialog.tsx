'use client'

import { useState } from 'react'
import { useWins } from '@/hooks/useWins'
import { useGoals } from '@/hooks/useGoals'
import { Button } from '@/components/ui/button'
import { Loader2, Target } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogBody
} from '@/components/ui/dialog'
import type { WinSize } from '@/types/wins'

const winSizeConfig = {
    small: { label: 'Маленькая', emoji: '🟢', color: 'bg-green-500/10 text-green-600' },
    medium: { label: 'Средняя', emoji: '🟡', color: 'bg-yellow-500/10 text-yellow-600' },
    large: { label: 'Большая', emoji: '🔴', color: 'bg-red-500/10 text-red-600' }
}

interface CreateWinDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void  // ⬅️ ДОБАВИЛИ
}

export function CreateWinDialog({ open, onOpenChange, onSuccess }: CreateWinDialogProps) {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [winSize, setWinSize] = useState<WinSize>('medium')
    const [selectedGoalId, setSelectedGoalId] = useState<string | undefined>(undefined)
    const [submitting, setSubmitting] = useState(false)

    const { addWin } = useWins()
    const { activeGoals } = useGoals()

    const handleAddWin = async () => {
        if (!title.trim()) return

        setSubmitting(true)
        const { error } = await addWin({
            title: title.trim(),
            description: description.trim() || undefined,
            size: winSize,
            goal_id: selectedGoalId
        })

        if (!error) {
            setTitle('')
            setDescription('')
            setWinSize('medium')
            setSelectedGoalId(undefined)
            onOpenChange(false)
            onSuccess?.()  // ⬅️ ДОБАВИЛИ
        }
        setSubmitting(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader onClose={() => onOpenChange(false)}>
                    <div>
                        <DialogTitle>Добавить победу</DialogTitle>
                        <DialogDescription>
                            Зафиксируйте своё достижение
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <DialogBody>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Название победы *</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Например: Закрыл сделку на 1М"
                                className="w-full p-3 rounded-xl border-0 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Размер победы</label>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.entries(winSizeConfig).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => setWinSize(key as WinSize)}
                                        className={`p-4 rounded-xl text-sm font-medium transition-all ${winSize === key
                                            ? config.color
                                            : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">{config.emoji}</div>
                                        {config.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <Target className="w-4 h-4 inline mr-1" />
                                Связано с целью (опционально)
                            </label>
                            <select
                                value={selectedGoalId || ''}
                                onChange={(e) => setSelectedGoalId(e.target.value || undefined)}
                                className="w-full p-3 rounded-xl border-0 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Не связано</option>
                                {activeGoals.map((goal) => (
                                    <option key={goal.id} value={goal.id}>
                                        {goal.title}
                                    </option>
                                ))}
                            </select>
                            <p className="text-xs text-muted-foreground mt-1">
                                💡 Выберите цель, к которой относится эта победа
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Описание (опционально)</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Добавьте детали..."
                                className="w-full min-h-[100px] p-3 rounded-xl border-0 bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="rounded-xl"
                            >
                                Отмена
                            </Button>
                            <Button
                                onClick={handleAddWin}
                                disabled={submitting || !title.trim()}
                                className="rounded-xl px-6 bg-gradient-to-r from-primary to-primary/80"
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Сохранение...
                                    </span>
                                ) : (
                                    'Добавить'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
}