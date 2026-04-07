'use client'

/**
 * ThoughtsPage
 * 
 * Страница мыслей и настроения — использует глобальный DataContext
 * Данные загружаются один раз при монтировании Layout
 * Переключение между вкладками мгновенное, без загрузки
 */

import { useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { Card } from '@/components/ui/card'
import { Brain, Plus, Loader2, Smile, Meh, Frown, Calendar as CalendarIcon } from 'lucide-react'
import { CreateThoughtDialog } from '@/components/thoughts/CreateThoughtDialog'
import { ThoughtDetailDialog } from '@/components/thoughts/ThoughtDetailDialog'
import { ThoughtFilters } from '@/components/thoughts/ThoughtFilters'
import { EditThoughtDialog } from '@/components/thoughts/EditThoughtDialog'

// Типы
type ThoughtFilterPeriod = 'today' | 'week' | 'month' | 'all'

type Thought = {
    id: string
    content: string
    mood: 'good' | 'neutral' | 'bad'
    created_at: string
    user_id: string
}

// Иконки для разных настроений
const moodIcons = {
    good: Smile,
    neutral: Meh,
    bad: Frown
}

// Цвета для разных настроений
const moodColors = {
    good: 'text-green-600',
    neutral: 'text-blue-600',
    bad: 'text-orange-600'
}

export default function ThoughtsPage() {
    const [showAddThought, setShowAddThought] = useState(false)
    const [period, setPeriod] = useState<ThoughtFilterPeriod>('today')
    const [selectedThought, setSelectedThought] = useState<Thought | null>(null)
    const [showThoughtDetail, setShowThoughtDetail] = useState(false)
    const [showEditThought, setShowEditThought] = useState(false)

    // Получаем данные из глобального контекста
    const { thoughts, thoughtsLoading: loading, refreshThoughts } = useData()

    // Фильтрация мыслей по периоду
    const filterThoughtsByPeriod = (period: ThoughtFilterPeriod): Thought[] => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        switch (period) {
            case 'today':
                return thoughts.filter(thought => {
                    const thoughtDate = new Date(thought.created_at)
                    return thoughtDate >= today
                })
            case 'week':
                const weekAgo = new Date(today)
                weekAgo.setDate(weekAgo.getDate() - 7)
                return thoughts.filter(thought => {
                    const thoughtDate = new Date(thought.created_at)
                    return thoughtDate >= weekAgo
                })
            case 'month':
                const monthAgo = new Date(today)
                monthAgo.setMonth(monthAgo.getMonth() - 1)
                return thoughts.filter(thought => {
                    const thoughtDate = new Date(thought.created_at)
                    return thoughtDate >= monthAgo
                })
            case 'all':
            default:
                return thoughts
        }
    }

    // Группировка мыслей по датам
    const groupThoughtsByDate = (thoughts: Thought[]) => {
        const groups: { [key: string]: Thought[] } = {}

        thoughts.forEach(thought => {
            const date = new Date(thought.created_at)
            const dateKey = date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            })

            if (!groups[dateKey]) {
                groups[dateKey] = []
            }
            groups[dateKey].push(thought)
        })

        return groups
    }

    // Фильтруем мысли по выбранному периоду
    const filteredThoughts = filterThoughtsByPeriod(period)
    // Группируем мысли по датам для отображения
    const groupedThoughts = groupThoughtsByDate(filteredThoughts)

    // Форматирование времени
    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    // Обработчик клика по мысли — открывает детальный просмотр
    const handleThoughtClick = (thought: Thought) => {
        setSelectedThought(thought)
        setShowThoughtDetail(true)
    }

    return (
        <>
            <div className="min-h-screen pb-32">
                <div className="space-y-6 p-6">
                    {/* Заголовок */}
                    <div className="space-y-1 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <Brain className="w-8 h-8 text-primary" strokeWidth={2} />
                            <h1 className="text-3xl font-bold tracking-tight">Мысли</h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Фиксируйте важные мысли и инсайты
                        </p>
                    </div>

                    {/* Фильтры по периодам */}
                    <ThoughtFilters period={period} onPeriodChange={setPeriod} />

                    {/* Список мыслей */}
                    {loading ? (
                        // Лоадер при загрузке
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : filteredThoughts.length === 0 ? (
                        // Пустое состояние
                        <div className="text-center py-12">
                            <Brain className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" strokeWidth={1.5} />
                            <p className="text-muted-foreground">
                                {period === 'today' ? 'Сегодня мыслей пока нет' : 'Мыслей за этот период нет'}
                            </p>
                        </div>
                    ) : (
                        // Список мыслей, сгруппированных по датам
                        <div className="space-y-6">
                            {Object.entries(groupedThoughts).map(([date, dateThoughts]) => (
                                <div key={date} className="space-y-3">
                                    {/* Разделитель даты */}
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <CalendarIcon className="w-4 h-4" />
                                        {date}
                                    </div>

                                    {/* Мысли в эту дату */}
                                    {dateThoughts.map((thought) => {
                                        const MoodIcon = moodIcons[thought.mood]
                                        const moodColor = moodColors[thought.mood]

                                        return (
                                            <div key={thought.id}>
                                                <Card
                                                    className="p-5 hover:shadow-lg transition-all cursor-pointer"
                                                    onClick={() => handleThoughtClick(thought)}
                                                >
                                                    <div className="flex items-start gap-4">
                                                        {/* Иконка настроения */}
                                                        <div className="mt-0.5">
                                                            <MoodIcon
                                                                className={`w-5 h-5 ${moodColor}`}
                                                                strokeWidth={2}
                                                            />
                                                        </div>
                                                        {/* Контент мысли */}
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm leading-relaxed mb-2 line-clamp-3">
                                                                {thought.content}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {formatTime(thought.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Фиксированная кнопка добавления внизу экрана */}
            <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto">
                <Card
                    onClick={() => setShowAddThought(true)}
                    className="p-4 cursor-pointer hover:shadow-lg transition-all border-dashed border-2 border-primary/30 hover:border-primary/50 bg-background"
                >
                    <div className="flex items-center justify-center gap-3 text-primary">
                        <Plus className="w-5 h-5" strokeWidth={2} />
                        <span className="font-medium">Добавить мысль</span>
                    </div>
                </Card>
            </div>

            {/* Диалог создания новой мысли */}
            <CreateThoughtDialog
                open={showAddThought}
                onOpenChange={setShowAddThought}
                onSuccess={refreshThoughts}
            />

            {/* Диалог детального просмотра мысли */}
            <ThoughtDetailDialog
                thought={selectedThought}
                open={showThoughtDetail}
                onOpenChange={setShowThoughtDetail}
                onEdit={(thought) => {
                    setSelectedThought(thought)
                    setShowThoughtDetail(false)
                    setShowEditThought(true)
                }}
                onDelete={refreshThoughts}
            />

            {/* Диалог редактирования мысли */}
            <EditThoughtDialog
                thought={selectedThought}
                open={showEditThought}
                onOpenChange={setShowEditThought}
                onSuccess={refreshThoughts}
            />
        </>
    )
}