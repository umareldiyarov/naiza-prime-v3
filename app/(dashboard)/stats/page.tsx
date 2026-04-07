'use client'

/**
 * StatsPage
 * 
 * Страница статистики — использует глобальный DataContext
 * Данные загружаются один раз при монтировании Layout
 * Переключение между вкладками мгновенное, без загрузки
 */

import { useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { useGoalStats } from '@/hooks/useGoalStats'
import { BarChart3, Loader2 } from 'lucide-react'
import { WinsStats } from '@/components/stats/WinsStats'
import { ThoughtsStats } from '@/components/stats/ThoughtsStats'
import { GoalsStats } from '@/components/stats/GoalsStats'

type TabType = 'wins' | 'thoughts' | 'goals'

export default function StatsPage() {
    // Активная вкладка (по умолчанию — победы)
    const [activeTab, setActiveTab] = useState<TabType>('wins')

    // Получаем данные из глобального контекста — без повторной загрузки
    const { wins, thoughts, winsLoading, thoughtsLoading } = useData()

    // Статистика целей остаётся в своём хуке
    const { stats, areaStats, priorityStats, upcomingDeadlines, overduedGoals } = useGoalStats()

    // Объединяем состояния загрузки
    const loading = winsLoading || thoughtsLoading

    // Показываем лоадер пока данные загружаются (только первый раз)
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6 pb-32">
            <div className="max-w-4xl mx-auto space-y-6">
                {/* Заголовок страницы */}
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-primary" strokeWidth={2} />
                        <h1 className="text-3xl font-bold tracking-tight">Статистика</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Анализ твоего прогресса и личного роста
                    </p>
                </div>

                {/* Вкладки для переключения между разделами статистики */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    <TabButton
                        active={activeTab === 'wins'}
                        onClick={() => setActiveTab('wins')}
                    >
                        🏆 Победы
                    </TabButton>
                    <TabButton
                        active={activeTab === 'thoughts'}
                        onClick={() => setActiveTab('thoughts')}
                    >
                        🧠 Мысли
                    </TabButton>
                    <TabButton
                        active={activeTab === 'goals'}
                        onClick={() => setActiveTab('goals')}
                    >
                        🎯 Цели
                    </TabButton>
                </div>

                {/* Контент выбранной вкладки */}
                <div className="pt-4">
                    {/* Статистика побед: графики, распределение по размеру, стрики */}
                    {activeTab === 'wins' && <WinsStats wins={wins as any} />}

                    {/* Статистика мыслей: настроение, тренды, динамика */}
                    {activeTab === 'thoughts' && <ThoughtsStats thoughts={thoughts} />}

                    {/* Статистика целей: прогресс, дедлайны, приоритеты */}
                    {activeTab === 'goals' && (
                        <GoalsStats
                            stats={stats}
                            areaStats={areaStats}
                            priorityStats={priorityStats}
                            upcomingDeadlines={upcomingDeadlines}
                            overduedGoals={overduedGoals}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}

/**
 * TabButton — кнопка переключения вкладок
 * 
 * @param active - активна ли вкладка
 * @param onClick - обработчик клика
 * @param children - содержимое кнопки (текст + эмодзи)
 */
function TabButton({
    active,
    onClick,
    children
}: {
    active: boolean
    onClick: () => void
    children: React.ReactNode
}) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${active
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'bg-muted/30 hover:bg-muted/50 text-muted-foreground'
                }`}
        >
            {children}
        </button>
    )
}