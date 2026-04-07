'use client'

import { useState } from 'react'
import { Calendar, Clock, Target, Edit, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogBody
} from '@/components/ui/dialog'
import { useWins } from '@/hooks/useWins'
import type { Win } from '@/types/wins'

const winSizeConfig = {
    small: { label: 'Маленькая', emoji: '🟢', color: 'bg-green-500/10 text-green-600' },
    medium: { label: 'Средняя', emoji: '🟡', color: 'bg-yellow-500/10 text-yellow-600' },
    large: { label: 'Большая', emoji: '🔴', color: 'bg-red-500/10 text-red-600' }
}

interface WinDetailDialogProps {
    win: Win | null
    goalTitle?: string
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit?: (win: Win) => void
    onDelete?: () => void
}

export function WinDetailDialog({ win, goalTitle, open, onOpenChange, onEdit, onDelete }: WinDetailDialogProps) {
    const [deleting, setDeleting] = useState(false)
    const { deleteWin } = useWins()

    if (!win) return null

    const config = winSizeConfig[win.size]

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
        const confirmed = window.confirm('Точно удалить эту победу?')
        if (!confirmed) return

        setDeleting(true)
        const { error } = await deleteWin(win.id)

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
                            <span className="text-2xl">{config.emoji}</span>
                        </div>
                        <DialogTitle className="text-left">Победа</DialogTitle>
                    </div>
                </DialogHeader>

                <DialogBody>
                    <div className="space-y-6">
                        {/* Название */}
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Название</p>
                            <p className="text-lg font-semibold">{win.title}</p>
                        </div>

                        {/* Размер победы */}
                        <div>
                            <p className="text-sm text-muted-foreground mb-2">Размер победы</p>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ${config.color}`}>
                                <span className="text-xl">{config.emoji}</span>
                                <span className="font-medium">{config.label}</span>
                            </div>
                        </div>

                        {/* Описание */}
                        {win.description && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Описание</p>
                                <p className="text-base leading-relaxed">{win.description}</p>
                            </div>
                        )}

                        {/* Связано с целью */}
                        {goalTitle && (
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Связано с целью</p>
                                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-primary/5">
                                    <Target className="w-5 h-5 text-primary" />
                                    <span className="font-medium text-primary">{goalTitle}</span>
                                </div>
                            </div>
                        )}

                        {/* Дата и время */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Дата</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <Calendar className="w-4 h-4 text-muted-foreground" />
                                    <span>{formatDate(win.created_at)}</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground mb-2">Время</p>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock className="w-4 h-4 text-muted-foreground" />
                                    <span>{formatTime(win.created_at)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Кнопки редактирования и удаления */}
                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="outline"
                                onClick={() => {
                                    onOpenChange(false)
                                    onEdit?.(win)
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