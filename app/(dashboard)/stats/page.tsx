'use client'

import { useEffect, useState } from 'react'
import { useWins } from '@/hooks/useWins'
import { useThoughts } from '@/hooks/useThoughts'
import { useContacts } from '@/hooks/useContacts'
import { useInfluenceAnalytics } from '@/hooks/useInfluenceAnalytics'
import { motion } from 'framer-motion'
import { BarChart3, Loader2 } from 'lucide-react'
import { WinsStats } from '@/components/stats/WinsStats'
import { ThoughtsStats } from '@/components/stats/ThoughtsStats'
import { ContactsStats } from '@/components/stats/ContactsStats'
import { InfluenceMap } from '@/components/influence/InfluenceMap'

type TabType = 'wins' | 'thoughts' | 'contacts' | 'influence'

export default function StatsPage() {
    const [activeTab, setActiveTab] = useState<TabType>('wins')
    const { wins, loading: winsLoading, loadWins } = useWins()
    const { thoughts, loading: thoughtsLoading, loadThoughts } = useThoughts()
    const { contacts, interactions, loading: contactsLoading, loadContacts } = useContacts()
    const { influenceScores, loading: influenceLoading, calculateInfluenceVectors } = useInfluenceAnalytics()

    useEffect(() => {
        loadWins()
        loadThoughts()
        loadContacts()
    }, [])

    useEffect(() => {
        if (activeTab === 'influence') {
            calculateInfluenceVectors()
        }
    }, [activeTab])

    const loading = winsLoading || thoughtsLoading || contactsLoading

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6 pb-32">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto space-y-6"
            >
                {/* Header */}
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-8 h-8 text-primary" strokeWidth={2} />
                        <h1 className="text-3xl font-bold tracking-tight">Статистика</h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Анализ твоего прогресса и влияния окружения
                    </p>
                </div>

                {/* Tabs */}
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
                        active={activeTab === 'contacts'}
                        onClick={() => setActiveTab('contacts')}
                    >
                        👥 Окружение
                    </TabButton>
                    <TabButton
                        active={activeTab === 'influence'}
                        onClick={() => setActiveTab('influence')}
                    >
                        🎯 Вектор Влияния
                    </TabButton>
                </div>

                {/* Content */}
                <div className="pt-4">
                    {activeTab === 'wins' && <WinsStats wins={wins as any} />}
                    {activeTab === 'thoughts' && <ThoughtsStats thoughts={thoughts} />}
                    {activeTab === 'contacts' && (
                        <ContactsStats contacts={contacts} interactions={interactions} />
                    )}
                    {activeTab === 'influence' && (
                        <>
                            {influenceLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                </div>
                            ) : (
                                <InfluenceMap scores={influenceScores} />
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    )
}

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