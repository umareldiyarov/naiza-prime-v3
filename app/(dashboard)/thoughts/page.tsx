'use client'

import { useState } from 'react'
import { useThoughts } from '@/hooks/useThoughts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Brain, Calendar, Loader2, Smile, Meh, Frown } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogBody
} from '@/components/ui/dialog'

const moodOptions = [
    { value: 'good' as const, label: 'Позитивное', icon: Smile, color: 'from-green-500/20 to-emerald-500/20', iconColor: 'text-green-600' },
    { value: 'neutral' as const, label: 'Нейтральное', icon: Meh, color: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-blue-600' },
    { value: 'bad' as const, label: 'Негативное', icon: Frown, color: 'from-orange-500/20 to-red-500/20', iconColor: 'text-orange-600' },
]

const moodIcons = {
    good: Smile,
    neutral: Meh,
    bad: Frown
}

const moodColors = {
    good: 'text-green-600',
    neutral: 'text-blue-600',
    bad: 'text-orange-600'
}

export default function ThoughtsPage() {
    const [content, setContent] = useState('')
    const [mood, setMood] = useState<'good' | 'neutral' | 'bad'>('neutral')
    const [showHistory, setShowHistory] = useState(false)
    const { thoughts, loading, loadThoughts, addThought } = useThoughts()
    const [submitting, setSubmitting] = useState(false)

    const handleAddThought = async () => {
        if (!content.trim()) return

        setSubmitting(true)
        const { error } = await addThought({
            content: content.trim(),
            mood
        })

        if (!error) {
            setContent('')
            setMood('neutral')

        }
        setSubmitting(false)
    }

    const handleOpenHistory = async () => {
        if (thoughts.length === 0) {
            await loadThoughts()
        }
        setShowHistory(true)
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
                                <Brain className="w-8 h-8 text-primary" strokeWidth={2} />
                                <h1 className="text-3xl font-bold tracking-tight">Мысли</h1>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Фиксируйте важные мысли и инсайты
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

                    {/* Input Card */}
                    <Card className="overflow-hidden border-primary/20">
                        <div className="p-6 space-y-4">
                            {/* Mood Selector */}
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

                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="Запишите вашу мысль или наблюдение..."
                                className="w-full min-h-[140px] p-4 rounded-xl border-0 bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-base placeholder:text-muted-foreground/60 transition-all"
                            />

                            <div className="flex items-center justify-between">
                                <span className="text-xs text-muted-foreground">
                                    {content.length > 0 && `${content.length} символов`}
                                </span>
                                <Button
                                    onClick={handleAddThought}
                                    disabled={submitting || !content.trim()}
                                    className="rounded-xl px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                                >
                                    {submitting ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Сохранение...
                                        </span>
                                    ) : (
                                        'Добавить запись'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            </div>

            {/* History Modal */}
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogContent>
                    <DialogHeader onClose={() => setShowHistory(false)}>
                        <div>
                            <DialogTitle>История мыслей</DialogTitle>
                            <DialogDescription>
                                Все ваши зафиксированные мысли и инсайты
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <DialogBody>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : thoughts.length === 0 ? (
                            <div className="text-center py-12">
                                <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" strokeWidth={1.5} />
                                <p className="text-muted-foreground">
                                    Записей пока нет. Добавьте первую мысль.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {thoughts.map((t, index) => {
                                    const MoodIcon = moodIcons[t.mood]
                                    const moodColor = moodColors[t.mood]

                                    return (
                                        <motion.div
                                            key={t.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                        >
                                            <Card className="p-5 hover:shadow-lg transition-all cursor-pointer group border-border/50">
                                                <div className="flex items-start gap-4">
                                                    <div className="mt-0.5">
                                                        <MoodIcon
                                                            className={`w-5 h-5 ${moodColor} group-hover:scale-110 transition-transform`}
                                                            strokeWidth={2}
                                                        />
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <p className="text-sm leading-relaxed text-foreground">
                                                            {t.content}
                                                        </p>
                                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                <time>
                                                                    {new Date(t.created_at).toLocaleString('ru-RU', {
                                                                        day: 'numeric',
                                                                        month: 'long',
                                                                        year: 'numeric',
                                                                        hour: '2-digit',
                                                                        minute: '2-digit',
                                                                    })}
                                                                </time>
                                                            </div>
                                                        </div>
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