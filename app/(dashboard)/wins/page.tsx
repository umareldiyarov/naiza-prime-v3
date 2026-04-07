'use client'

/**
 * WinsPage
 * 
 * Страница побед — использует глобальный DataContext
 * Данные загружаются один раз при монтировании Layout
 * Переключение между вкладками мгновенное, без загрузки
 */

import { useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { useGoals } from '@/hooks/useGoals'
import { Card } from '@/components/ui/card'
import { Trophy, Plus, Loader2, Target, Clock } from 'lucide-react'
import { CreateWinDialog } from '@/components/wins/CreateWinDialog'
import { WinDetailDialog } from '@/components/wins/WinDetailDialog'
import { WinFilters } from '@/components/wins/WinFilters'
import type { Win } from '@/types/wins'
import { EditWinDialog } from '@/components/wins/EditWinDialog'

// Тип для периода фильтрации
type WinFilterPeriod = 'today' | 'week' | 'month' | 'all'

const winSizeConfig = {
    small: { label: 'Маленькая', emoji: '🟢', color: 'bg-green-500/10 text-green-600' },
    medium: { label: 'Средняя', emoji: '🟡', color: 'bg-yellow-500/10 text-yellow-600' },
    large: { label: 'Большая', emoji: '🔴', color: 'bg-red-500/10 text-red-600' }
}

export default function WinsPage() {
    const [showAddWin, setShowAddWin] = useState(false)
    const [period, setPeriod] = useState<WinFilterPeriod>('today')
    const [selectedWin, setSelectedWin] = useState<Win | null>(null)
    const [showWinDetail, setShowWinDetail] = useState(false)
    const [showEditWin, setShowEditWin] = useState(false)

    // Получаем данные из глобального контекста
    const { wins, winsLoading: loading, refreshWins } = useData()
    const { goals } = useGoals()

    // Фильтрация побед по периоду
    const filterWinsByPeriod = (period: WinFilterPeriod): Win[] => {
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())

        switch (period) {
            case 'today':
                return wins.filter(win => {
                    const winDate = new Date(win.created_at)
                    return winDate >= today
                })
            case 'week':
                const weekAgo = new Date(today)
                weekAgo.setDate(weekAgo.getDate() - 7)
                return wins.filter(win => {
                    const winDate = new Date(win.created_at)
                    return winDate >= weekAgo
                })
            case 'month':
                const monthAgo = new Date(today)
                monthAgo.setDate(monthAgo.getDate() - 30)
                return wins.filter(win => {
                    const winDate = new Date(win.created_at)
                    return winDate >= monthAgo
                })
            case 'all':
            default:
                return wins
        }
    }

    // Группировка побед по времени
    const groupWinsByTime = (wins: Win[]) => {
        const groups: { [key: string]: Win[] } = {}

        wins.forEach(win => {
            const date = new Date(win.created_at)
            const timeKey = date.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit'
            })

            if (!groups[timeKey]) {
                groups[timeKey] = []
            }
            groups[timeKey].push(win)
        })

        return groups
    }

    const filteredWins = filterWinsByPeriod(period)
    const groupedWins = period === 'today' ? groupWinsByTime(filteredWins) : null

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long'
        })
    }

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const getGoalTitle = (goalId?: string) => {
        if (!goalId) return null
        const goal = goals.find(g => g.id === goalId)
        return goal?.title
    }

    const handleWinClick = (win: Win) => {
        setSelectedWin(win)
        setShowWinDetail(true)
    }

    return (
        <>
            <div className="min-h-screen pb-32">
                <div className="space-y-6 p-6">
                    {/* Заголовок */}
                    <div className="space-y-1 text-center">
                        <div className="flex items-center justify-center gap-3">
                            <Trophy className="w-8 h-8 text-primary" strokeWidth={2} />
                            <h1 className="text-3xl font-bold tracking-tight">Победы</h1>
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Фиксируйте свои достижения
                        </p>
                    </div>

                    {/* Фильтры (табы) */}
                    <WinFilters period={period} onPeriodChange={setPeriod} />

                    {/* Список побед */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : filteredWins.length === 0 ? (
                        <div className="text-center py-12">
                            <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" strokeWidth={1.5} />
                            <p className="text-muted-foreground">
                                {period === 'today' ? 'Сегодня побед пока нет' : 'Побед за этот период нет'}
                            </p>
                        </div>
                    ) : period === 'today' && groupedWins ? (
                        // Группировка по времени для "Сегодня"
                        <div className="space-y-6">
                            {Object.entries(groupedWins).map(([time, timeWins]) => (
                                <div key={time} className="space-y-3">
                                    {/* Разделитель времени */}
                                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        <Clock className="w-4 h-4" />
                                        {time}
                                    </div>

                                    {/* Победы в это время */}
                                    {timeWins.map((win) => {
                                        const sizeConfig = winSizeConfig[win.size]
                                        const goalTitle = getGoalTitle(win.goal_id)
                                        return (
                                            <div key={win.id}>
                                                <Card
                                                    className="p-5 hover:shadow-lg transition-all cursor-pointer"
                                                    onClick={() => handleWinClick(win)}
                                                >
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
                                                            {goalTitle && (
                                                                <div className="flex items-center gap-1.5 text-xs text-primary">
                                                                    <Target className="w-3 h-3" />
                                                                    <span>{goalTitle}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Card>
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    ) : (
                        // Обычный список для остальных периодов
                        <div className="space-y-3">
                            {filteredWins.map((win) => {
                                const sizeConfig = winSizeConfig[win.size]
                                const goalTitle = getGoalTitle(win.goal_id)
                                return (
                                    <div key={win.id}>
                                        <Card
                                            className="p-5 hover:shadow-lg transition-all cursor-pointer"
                                            onClick={() => handleWinClick(win)}
                                        >
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
                                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mb-2">
                                                        <span>{formatDate(win.created_at)} • {formatTime(win.created_at)}</span>
                                                    </div>
                                                    {goalTitle && (
                                                        <div className="flex items-center gap-1.5 text-xs text-primary">
                                                            <Target className="w-3 h-3" />
                                                            <span>{goalTitle}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Фиксированная кнопка внизу */}
            <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto">
                <Card
                    onClick={() => setShowAddWin(true)}
                    className="p-4 cursor-pointer hover:shadow-lg transition-all border-dashed border-2 border-primary/30 hover:border-primary/50 bg-background"
                >
                    <div className="flex items-center justify-center gap-3 text-primary">
                        <Plus className="w-5 h-5" strokeWidth={2} />
                        <span className="font-medium">Добавить победу</span>
                    </div>
                </Card>
            </div>

            <CreateWinDialog
                open={showAddWin}
                onOpenChange={setShowAddWin}
                onSuccess={refreshWins}
            />

            <WinDetailDialog
                win={selectedWin}
                goalTitle={selectedWin ? getGoalTitle(selectedWin.goal_id) || undefined : undefined}
                open={showWinDetail}
                onOpenChange={setShowWinDetail}
                onEdit={(win) => {
                    setSelectedWin(win)
                    setShowWinDetail(false)
                    setShowEditWin(true)
                }}
                onDelete={refreshWins}
            />

            <EditWinDialog
                win={selectedWin}
                open={showEditWin}
                onOpenChange={setShowEditWin}
                onSuccess={refreshWins}
            />
        </>
    )
}