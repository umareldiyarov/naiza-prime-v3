'use client'

import { useState, useEffect } from 'react'
import { useThoughts } from '@/hooks/useThoughts'
import { Button } from '@/components/ui/button'
import { Loader2, Smile, Meh, Frown } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogBody
} from '@/components/ui/dialog'
import type { Thought, ThoughtMood } from '@/hooks/useThoughts'

const moodConfig = {
    good: { label: 'Позитивное', icon: Smile, color: 'bg-green-500/10 text-green-600' },
    neutral: { label: 'Нейтральное', icon: Meh, color: 'bg-blue-500/10 text-blue-600' },
    bad: { label: 'Негативное', icon: Frown, color: 'bg-orange-500/10 text-orange-600' }
}

interface EditThoughtDialogProps {
    thought: Thought | null
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function EditThoughtDialog({ thought, open, onOpenChange, onSuccess }: EditThoughtDialogProps) {
    const [content, setContent] = useState('')
    const [mood, setMood] = useState<ThoughtMood>('neutral')
    const [submitting, setSubmitting] = useState(false)

    const { updateThought } = useThoughts()

    useEffect(() => {
        if (thought && open) {
            setContent(thought.content)
            setMood(thought.mood)
        }
    }, [thought, open])

    const handleUpdate = async () => {
        if (!thought || !content.trim()) return

        setSubmitting(true)
        const { error } = await updateThought(thought.id, {
            content: content.trim(),
            mood
        })

        if (!error) {
            onOpenChange(false)
            onSuccess?.()
        }
        setSubmitting(false)
    }

    if (!thought) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader onClose={() => onOpenChange(false)}>
                    <div>
                        <DialogTitle>Редактировать мысль</DialogTitle>
                        <DialogDescription>
                            Измените содержание или настроение
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <DialogBody>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Настроение</label>
                            <div className="grid grid-cols-3 gap-3">
                                {Object.entries(moodConfig).map(([key, config]) => {
                                    const MoodIcon = config.icon
                                    return (
                                        <button
                                            key={key}
                                            onClick={() => setMood(key as ThoughtMood)}
                                            className={`p-4 rounded-xl text-sm font-medium transition-all ${mood === key
                                                    ? config.color
                                                    : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                                                }`}
                                        >
                                            <MoodIcon className="w-6 h-6 mx-auto mb-1" strokeWidth={2} />
                                            {config.label}
                                        </button>
                                    )
                                })}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Содержание *</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Что у вас на уме?"
                                className="w-full min-h-[150px] p-3 rounded-xl border-0 bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                                onClick={handleUpdate}
                                disabled={submitting || !content.trim()}
                                className="rounded-xl px-6 bg-gradient-to-r from-primary to-primary/80"
                            >
                                {submitting ? (
                                    <span className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Сохранение...
                                    </span>
                                ) : (
                                    'Сохранить'
                                )}
                            </Button>
                        </div>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
}