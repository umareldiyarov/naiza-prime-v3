'use client'

import { useState } from 'react'
import { useWins } from '@/hooks/useWins'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Trophy, Plus, Loader2 } from 'lucide-react'
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

export default function WinsPage() {
    const [showAddWin, setShowAddWin] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [winSize, setWinSize] = useState<WinSize>('medium')
    const { wins, loading, addWin } = useWins()
    const [submitting, setSubmitting] = useState(false)

    const handleAddWin = async () => {
        if (!title.trim()) return

        setSubmitting(true)
        const { error } = await addWin({
            title: title.trim(),
            description: description.trim() || undefined,
            size: winSize
        })

        if (!error) {
            setTitle('')
            setDescription('')
            setWinSize('medium')
            setShowAddWin(false)
        }
        setSubmitting(false)
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
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <div className="flex items-center gap-3">
                                <Trophy className="w-8 h-8 text-primary" strokeWidth={2} />
                                <h1 className="text-3xl font-bold tracking-tight">Победы</h1>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Фиксируйте свои достижения
                            </p>
                        </div>
                    </div>

                    <Card
                        onClick={() => setShowAddWin(true)}
                        className="p-6 cursor-pointer hover:shadow-lg transition-all border-dashed border-2 border-primary/30 hover:border-primary/50"
                    >
                        <div className="flex items-center justify-center gap-3 text-primary">
                            <Plus className="w-5 h-5" strokeWidth={2} />
                            <span className="font-medium">Добавить победу</span>
                        </div>
                    </Card>

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : wins.length === 0 ? (
                        <div className="text-center py-12">
                            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" strokeWidth={1.5} />
                            <p className="text-muted-foreground">
                                Побед пока нет. Добавьте первую победу!
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {wins.map((win, index) => {
                                const sizeConfig = winSizeConfig[win.size]
                                return (
                                    <motion.div
                                        key={win.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="p-5 hover:shadow-lg transition-all border-border/50">
                                            <div className="flex items-start gap-4">
                                                <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${sizeConfig.color}`}>
                                                    <span className="text-xl">{sizeConfig.emoji}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-lg mb-1">
                                                        {win.title}
                                                    </h3>
                                                    {win.description && (
                                                        <p className="text-sm text-muted-foreground mb-2">
                                                            {win.description}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                        <span>{formatDate(win.created_at)}</span>
                                                        <span className={`px-2 py-0.5 rounded-full ${sizeConfig.color}`}>
                                                            {sizeConfig.label}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </motion.div>
            </div>

            <Dialog open={showAddWin} onOpenChange={setShowAddWin}>
                <DialogContent>
                    <DialogHeader onClose={() => setShowAddWin(false)}>
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
                                            className={`p-4 rounded-xl text-sm font-medium transition-all ${winSize === key ? config.color : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'
                                                }`}
                                        >
                                            <div className="text-2xl mb-1">{config.emoji}</div>
                                            {config.label}
                                        </button>
                                    ))}
                                </div>
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
                                    onClick={() => setShowAddWin(false)}
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
        </>
    )
}