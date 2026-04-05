'use client'

import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { TrendingUp, Anchor, Minus, Clock, Target } from 'lucide-react'
import type { ContactInfluenceScore } from '@/types/contacts'

interface InfluenceMapProps {
    scores: ContactInfluenceScore[]
    onContactClick?: (contactId: string) => void
}

export function InfluenceMap({ scores, onContactClick }: InfluenceMapProps) {
    const accelerators = scores.filter(s => s.vector_type === 'accelerator')
    const anchors = scores.filter(s => s.vector_type === 'anchor')
    const neutral = scores.filter(s => s.vector_type === 'neutral')

    return (
        <div className="space-y-6">
            {/* Ускорители */}
            {accelerators.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" strokeWidth={2} />
                        <h3 className="font-semibold text-lg">🚀 Ускорители</h3>
                        <span className="text-sm text-muted-foreground">
                            ({accelerators.length})
                        </span>
                    </div>
                    <div className="grid gap-3">
                        {accelerators.map((score, index) => (
                            <AcceleratorCard
                                key={score.contact_id}
                                score={score}
                                index={index}
                                onClick={() => onContactClick?.(score.contact_id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Якоря */}
            {anchors.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Anchor className="w-5 h-5 text-red-600" strokeWidth={2} />
                        <h3 className="font-semibold text-lg">⚓ Якоря</h3>
                        <span className="text-sm text-muted-foreground">
                            ({anchors.length})
                        </span>
                    </div>
                    <div className="grid gap-3">
                        {anchors.map((score, index) => (
                            <AnchorCard
                                key={score.contact_id}
                                score={score}
                                index={index}
                                onClick={() => onContactClick?.(score.contact_id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Нейтральные */}
            {neutral.length > 0 && (
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Minus className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
                        <h3 className="font-semibold text-lg">➖ Нейтральные</h3>
                        <span className="text-sm text-muted-foreground">
                            ({neutral.length})
                        </span>
                    </div>
                    <div className="grid gap-3">
                        {neutral.map((score, index) => (
                            <NeutralCard
                                key={score.contact_id}
                                score={score}
                                index={index}
                                onClick={() => onContactClick?.(score.contact_id)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Пустое состояние */}
            {scores.length === 0 && (
                <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                        Недостаточно данных для анализа влияния
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Добавь встречи с контактами и фиксируй победы
                    </p>
                </Card>
            )}
        </div>
    )
}

// Карточка Ускорителя
function AcceleratorCard({
    score,
    index,
    onClick
}: {
    score: ContactInfluenceScore
    index: number
    onClick: () => void
}) {
    const strengthBars = Math.min(Math.ceil(score.vector_strength / 20), 5)

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card
                className="p-4 cursor-pointer hover:shadow-lg transition-all border-green-500/20 bg-green-500/5"
                onClick={onClick}
            >
                <div className="space-y-3">
                    {/* Заголовок */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h4 className="font-semibold text-lg">{score.contact_name}</h4>
                            <p className="text-sm text-muted-foreground">
                                {getCategoryLabel(score.category)}
                            </p>
                        </div>
                        <div className="flex gap-0.5">
                            {Array.from({ length: strengthBars }).map((_, i) => (
                                <div key={i} className="w-1.5 h-6 bg-green-600 rounded-full" />
                            ))}
                        </div>
                    </div>

                    {/* Главная метрика */}
                    <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" strokeWidth={2} />
                        <span className="text-2xl font-bold text-green-600">
                            +{score.wins_delta}%
                        </span>
                        <span className="text-sm text-muted-foreground">
                            побед после встреч
                        </span>
                    </div>

                    {/* Дополнительная инфа */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                {score.total_meetings} встреч
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">
                                {score.total_hours_spent}ч потрачено
                            </span>
                        </div>
                    </div>

                    {/* Shadow Cost (даже у ускорителей есть цена) */}
                    {score.shadow_cost_goals > 0 && (
                        <div className="pt-2 border-t border-border">
                            <p className="text-xs text-muted-foreground">
                                💰 Время = ~{score.shadow_cost_goals} подцелей
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    )
}

// Карточка Якоря
function AnchorCard({
    score,
    index,
    onClick
}: {
    score: ContactInfluenceScore
    index: number
    onClick: () => void
}) {
    const strengthBars = Math.min(Math.ceil(score.vector_strength / 20), 5)

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card
                className="p-4 cursor-pointer hover:shadow-lg transition-all border-red-500/20 bg-red-500/5"
                onClick={onClick}
            >
                <div className="space-y-3">
                    {/* Заголовок */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h4 className="font-semibold text-lg">{score.contact_name}</h4>
                            <p className="text-sm text-muted-foreground">
                                {getCategoryLabel(score.category)}
                            </p>
                        </div>
                        <div className="flex gap-0.5">
                            {Array.from({ length: strengthBars }).map((_, i) => (
                                <div key={i} className="w-1.5 h-6 bg-red-600 rounded-full" />
                            ))}
                        </div>
                    </div>

                    {/* Главная метрика */}
                    <div className="flex items-center gap-2">
                        <Anchor className="w-4 h-4 text-red-600" strokeWidth={2} />
                        <span className="text-2xl font-bold text-red-600">
                            {score.wins_delta}%
                        </span>
                        <span className="text-sm text-muted-foreground">
                            побед после встреч
                        </span>
                    </div>

                    {/* Дополнительная инфа */}
                    <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-muted-foreground">
                                {score.total_meetings} встреч
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">
                                {score.total_hours_spent}ч потрачено
                            </span>
                        </div>
                    </div>

                    {/* Shadow Cost (ЖЁСТКИЙ) */}
                    {score.shadow_cost_goals > 0 && (
                        <div className="pt-2 border-t border-red-500/20 bg-red-500/10 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
                            <div className="flex items-start gap-2">
                                <Target className="w-4 h-4 text-red-600 shrink-0 mt-0.5" strokeWidth={2} />
                                <div>
                                    <p className="text-sm font-medium text-red-600">
                                        💀 Shadow Cost: {score.total_hours_spent}ч
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Вместо этого ты мог закрыть ~{score.shadow_cost_goals} подцелей
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </motion.div>
    )
}

// Карточка Нейтрального
function NeutralCard({
    score,
    index,
    onClick
}: {
    score: ContactInfluenceScore
    index: number
    onClick: () => void
}) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card
                className="p-4 cursor-pointer hover:shadow-lg transition-all"
                onClick={onClick}
            >
                <div className="space-y-3">
                    {/* Заголовок */}
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h4 className="font-semibold">{score.contact_name}</h4>
                            <p className="text-sm text-muted-foreground">
                                {getCategoryLabel(score.category)}
                            </p>
                        </div>
                        <Minus className="w-5 h-5 text-muted-foreground" strokeWidth={2} />
                    </div>

                    {/* Метрика */}
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-muted-foreground">
                            ~{score.wins_delta}%
                        </span>
                        <span className="text-sm text-muted-foreground">
                            нейтральное влияние
                        </span>
                    </div>

                    {/* Дополнительная инфа */}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{score.total_meetings} встреч</span>
                        <span>{score.total_hours_spent}ч</span>
                    </div>
                </div>
            </Card>
        </motion.div>
    )
}

// Вспомогательная функция
function getCategoryLabel(category: string): string {
    const labels: Record<string, string> = {
        work: '💼 Работа',
        friend: '👥 Друзья',
        family: '👨‍👩‍👧 Семья',
        mentor: '🎓 Наставник',
        partner: '❤️ Партнёр',
        other: '📌 Другое'
    }
    return labels[category] || category
}