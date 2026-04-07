'use client'

import { motion } from 'framer-motion'
import type { ThoughtFilterPeriod } from '@/hooks/useThoughts'

interface ThoughtFiltersProps {
    period: ThoughtFilterPeriod
    onPeriodChange: (period: ThoughtFilterPeriod) => void
}

const periods: { value: ThoughtFilterPeriod; label: string }[] = [
    { value: 'today', label: 'Сегодня' },
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
    { value: 'all', label: 'Всё время' }
]

export function ThoughtFilters({ period, onPeriodChange }: ThoughtFiltersProps) {
    return (
        <div className="flex justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {periods.map((p) => (
                <button
                    key={p.value}
                    onClick={() => onPeriodChange(p.value)}
                    className={`
                        relative px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap
                        transition-colors
                        ${period === p.value
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }
                    `}
                >
                    {p.label}
                    {period === p.value && (
                        <motion.div
                            layoutId="activeThoughtTab"
                            className="absolute inset-0 bg-primary/10 rounded-lg -z-10"
                            transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                </button>
            ))}
        </div>
    )
}