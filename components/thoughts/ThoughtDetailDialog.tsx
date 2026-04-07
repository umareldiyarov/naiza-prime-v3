'use client'

import { useState } from 'react'
import { Calendar, Clock, Smile, Meh, Frown, Edit, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody
} from '@/components/ui/dialog'
import { useThoughts } from '@/hooks/useThoughts'
import type { Thought } from '@/hooks/useThoughts'

const moodConfig = {
    good: { label: 'Позитивное', icon: Smile, color: 'bg-green-500/10 text-green-600' },
    neutral: { label: 'Нейтральное', icon: Meh, color: 'bg-blue-500/10 text-blue-600' },
    bad: { label: 'Негативное', icon: Frown, color: 'bg-orange-500/10 text-orange-600' }
}

interface ThoughtDetailDialogProps {
    thought: Thought | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit?: (thought: Thought) => void
    onDelete?: () => void
}

export function ThoughtDetailDialog({ thought, open, onOpenChange, onEdit, onDelete }: ThoughtDetailDialogProps) {
    const [deleting, setDeleting] = useState(false)
    const { deleteThought } = useThoughts()

    if (!thought) return null

    const config = moodConfig[thought.mood]
    const MoodIcon = config.icon

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleDelete = async () => {
        const confirmed = window.confirm('Точно удалить эту мысль?')
        if (!confirmed) return

        setDeleting(true)
        const { error } = await deleteThought(thought.id)

        if (!error) {
            onOpenChange(false)
            onDelete?.()
        }
        setDeleting(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader onClose={() => onOpenChange(false)}>
                    <div className="flex items-center gap-3">
                        <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${config.color}`}>
                            <MoodIcon className="w-6 h-6" strokeWidth={2} />
                        </div>
                        <DialogTitle className="text-left">Мысль</DialogTitle>
                    </div>
                </DialogHeader>

                <DialogBody>
                    <div className="space-y-6">
                        {/* Настроение */}
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Настроение</p>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${config.color}`}>
                                <MoodIcon className="w-5 h-5" strokeWidth={2} />
                                <span className="font-medium">{config.label}</span>
                            </div>
                        </div>

                        {/* Содержание */}
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Содержание</p>
                            <p className="text-base leading-relaxed">{thought.content}</p>
                        </div>

                        {/* Дата и время */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Дата</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{formatDate(thought.created_at)}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Время</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>{formatTime(thought.created_at)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Кнопки редактирования и удаления */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onOpenChange(false)
                                    onEdit?.(thought)
                                }}
                                className="flex-1 rounded-xl"
                            >
                                <Edit className="w-4 h-4 mr-2" />
                                Редактировать
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 rounded-xl"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Удаление...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        Удалить
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
}