'use client'

import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Filter, ArrowUpDown } from 'lucide-react'

export type GoalFilterStatus = 'all' | 'active' | 'completed' | 'paused' | 'cancelled'
export type GoalSortBy = 'created' | 'priority' | 'progress' | 'deadline'

interface GoalFiltersProps {
    status: GoalFilterStatus
    sortBy: GoalSortBy
    onStatusChange: (status: GoalFilterStatus) => void
    onSortChange: (sort: GoalSortBy) => void
}

export function GoalFilters({ status, sortBy, onStatusChange, onSortChange }: GoalFiltersProps) {
    return (
        <div className="flex items-center gap-3">
            {/* Фильтр по статусу */}
            <div className="flex-1">
                <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-full">
                        <Filter className="w-4 h-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все цели</SelectItem>
                        <SelectItem value="active">🟢 Активные</SelectItem>
                        <SelectItem value="completed">✅ Завершённые</SelectItem>
                        <SelectItem value="paused">⏸️ На паузе</SelectItem>
                        <SelectItem value="cancelled">❌ Отменённые</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Сортировка */}
            <div className="flex-1">
                <Select value={sortBy} onValueChange={onSortChange}>
                    <SelectTrigger className="w-full">
                        <ArrowUpDown className="w-4 h-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="created">По дате создания</SelectItem>
                        <SelectItem value="priority">По приоритету</SelectItem>
                        <SelectItem value="progress">По прогрессу</SelectItem>
                        <SelectItem value="deadline">По дедлайну</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    )
}