'use client'

import { useState } from 'react'
import { useGoals } from '@/hooks/useGoals'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogBody
} from '@/components/ui/dialog'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import type { GoalPriority } from '@/types/goals'

interface CreateGoalDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function CreateGoalDialog({ open, onOpenChange }: CreateGoalDialogProps) {
    const { createGoal } = useGoals()
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)

    const [formData, setFormData] = useState({
        title: '',
        motivation: '',
        target_value: '',
        unit: '',
        deadline: '',
        priority: 'medium' as GoalPriority,
    })

    const handleNext = () => {
        if (formData.title.trim()) {
            setStep(2)
        }
    }

    const handleBack = () => {
        setStep(1)
    }

    const handleSubmit = async () => {
        if (!formData.title.trim()) return

        setLoading(true)
        try {
            await createGoal({
                title: formData.title.trim(),
                description: formData.motivation.trim() || undefined,
                type: 'outcome',
                target_value: formData.target_value ? Number(formData.target_value) : undefined,
                unit: formData.unit || undefined,
                deadline: formData.deadline || undefined,
                priority: formData.priority,
            })

            window.dispatchEvent(new Event('goals-updated'))

            // Сброс формы
            setFormData({
                title: '',
                motivation: '',
                target_value: '',
                unit: '',
                deadline: '',
                priority: 'medium',
            })
            setStep(1)
            onOpenChange(false)
        } catch (error) {
            console.error('Error creating goal:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setFormData({
            title: '',
            motivation: '',
            target_value: '',
            unit: '',
            deadline: '',
            priority: 'medium',
        })
        setStep(1)
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent>
                <DialogHeader onClose={handleClose}>
                    <div>
                        <DialogTitle>
                            {step === 1 ? 'Создать цель' : formData.title}
                        </DialogTitle>
                        <DialogDescription>
                            {step === 1 ? 'Шаг 1 из 2' : 'Шаг 2 из 2 — Детали'}
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <DialogBody>
                    {/* ШАГ 1: Название и мотивация */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Название цели *
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Например: Заработать 1М ₽"
                                    className="w-full p-3 rounded-xl border-0 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    autoFocus
                                />
                            </div>

                            <div style={{ marginTop: '2.5rem' }}>  {/* ⬅️ 40px отступ */}
                                <label className="block text-sm font-medium mb-2">
                                    Зачем эта цель для тебя важна? (опционально)
                                </label>
                                <textarea
                                    value={formData.motivation}
                                    onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                                    placeholder="Например: Помочь родителям купить квартиру"
                                    className="w-full min-h-[100px] p-3 rounded-xl border-0 bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <Button
                                onClick={handleNext}
                                disabled={!formData.title.trim()}
                                className="w-full rounded-xl h-12 text-base"
                            >
                                Далее
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </Button>
                        </div>
                    )}

                    {/* ШАГ 2: Детали */}
                    {step === 2 && (
                        <div className="space-y-6">  {/* ⬅️ БЫЛО space-y-5, СТАЛО space-y-6 */}
                            {/* Целевое значение + Единица */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Целевое значение (опционально)
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <input
                                        type="number"
                                        value={formData.target_value}
                                        onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                                        placeholder="1000000"
                                        className="p-3 rounded-xl border-0 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    />
                                    <Select
                                        value={formData.unit}
                                        onValueChange={(value) => setFormData({ ...formData, unit: value })}
                                    >
                                        <SelectTrigger className="rounded-xl bg-muted/30 border-0">
                                            <SelectValue placeholder="Единица" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="₽">₽ (рубли)</SelectItem>
                                            <SelectItem value="$">$ (доллары)</SelectItem>
                                            <SelectItem value="км">км (километры)</SelectItem>
                                            <SelectItem value="кг">кг (килограммы)</SelectItem>
                                            <SelectItem value="шт">шт (штуки)</SelectItem>
                                            <SelectItem value="раз">раз (повторения)</SelectItem>
                                            <SelectItem value="часов">часов</SelectItem>
                                            <SelectItem value="дней">дней</SelectItem>
                                            <SelectItem value="страниц">страниц</SelectItem>
                                            <SelectItem value="%">% (проценты)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Срок выполнения */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Срок выполнения (опционально)
                                </label>
                                <input
                                    type="date"
                                    value={formData.deadline}
                                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                                    className="w-full p-3 rounded-xl border-0 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            {/* Приоритет */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Приоритет (опционально)
                                </label>
                                <Select
                                    value={formData.priority}
                                    onValueChange={(value: GoalPriority) => setFormData({ ...formData, priority: value })}
                                >
                                    <SelectTrigger className="rounded-xl bg-muted/30 border-0">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="high">🔥 Высокий</SelectItem>
                                        <SelectItem value="medium">⚡ Средний</SelectItem>
                                        <SelectItem value="low">⭐ Низкий</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Кнопки */}
                            <div className="flex gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={handleBack}
                                    className="flex-1 rounded-xl h-12"
                                    disabled={loading}
                                >
                                    <ArrowLeft className="w-5 h-5 mr-2" />
                                    Назад
                                </Button>
                                <Button
                                    onClick={handleSubmit}
                                    className="flex-1 rounded-xl h-12 bg-gradient-to-r from-primary to-primary/80"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Создание...
                                        </>
                                    ) : (
                                        'Создать цель'
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogBody>
            </DialogContent>
        </Dialog>
    )
}