'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Smile, Meh, Frown } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogBody
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useThoughts, type ThoughtMood } from '@/hooks/useThoughts'

const moodOptions = [
    { value: 'good' as const, label: 'Позитивное', icon: Smile, color: 'from-green-500/20 to-emerald-500/20', iconColor: 'text-green-600' },
    { value: 'neutral' as const, label: 'Нейтральное', icon: Meh, color: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-600' },
    { value: 'bad' as const, label: 'Негативное', icon: Frown, color: 'from-orange-500/20 to-red-500/20', iconColor: 'text-orange-600' },
]

interface CreateThoughtDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function CreateThoughtDialog({ open, onOpenChange, onSuccess }: CreateThoughtDialogProps) {
    const [content, setContent] = useState('')
    const [mood, setMood] = useState<ThoughtMood>('neutral')
    const [submitting, setSubmitting] = useState(false)
    const { addThought } = useThoughts()

    const handleSubmit = async () => {
        if (!content.trim()) return

        setSubmitting(true)
        const { error } = await addThought({
            content: content.trim(),
            mood
        })

        if (!error) {
            setContent('')
            setMood('neutral')
            onOpenChange(false)
            onSuccess?.()
        }
        setSubmitting(false)
    }

    const handleClose = () => {
        if (!submitting) {
            setContent('')
            setMood('neutral')
            onOpenChange(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader onClose={handleClose}>
                    <div>
                        <DialogTitle>Новая мысль</DialogTitle>
                        <DialogDescription>
                            Зафиксируйте важную мысль или инсайт
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <DialogBody>
                    <div className="space-y-4">
                        {/* Mood Selector */}
                        <div>
                            <label className="text-sm font-medium mb-3 block">Настроение</label>
                            <div className="grid grid-cols-3 gap-2">
                                {moodOptions.map((m) => {
                                    const Icon = m.icon
                                    return (
                                        <motion.button
                                            key={m.value}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            onClick={() => setMood(m.value)}
                                            className={`relative py-3 rounded-xl text-sm font-medium transition-all overflow-hidden ${mood === m.value
                                                ? 'text-foreground shadow-md'
                                                : 'text-muted-foreground hover:text-foreground'
                                                }`}
                                        >
                                            {mood === m.value && (
                                                <motion.div
                                                    layoutId="moodBg"
                                                    className={`absolute inset-0 bg-gradient-to-br ${m.color}`}
                                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                <Icon className={`w-4 h-4 ${mood === m.value ? m.iconColor : ''}`} strokeWidth={2} />
                                                {m.label}
                                            </span>
                                        </motion.button>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Content */}
                        <div>
                            <label className="text-sm font-medium mb-3 block">Содержание</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Запишите вашу мысль или наблюдение..."
                                className="w-full min-h-[140px] p-4 rounded-xl border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-base placeholder:text-muted-foreground/60 transition-all"
                                disabled={submitting}
                                autoFocus
                            />
                            {content.length > 0 && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    {content.length} символов
                                </p>
                            )}
                        </div>

                        <Button
                            onClick={handleSubmit}
                            disabled={submitting || !content.trim()}
                            className="w-full rounded-xl"
                        >
                            {submitting ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Сохранение...
                                </span>
                            ) : (
                                'Сохранить мысль'
                            )}
                        </Button>
                    </div>
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
}