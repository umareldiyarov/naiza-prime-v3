'use client'

import { useState } from 'react'
import { useContacts } from '@/hooks/useContacts'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Users, Plus, Calendar, Loader2, TrendingUp, TrendingDown, Minus, MessageSquare } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogBody
} from '@/components/ui/dialog'
import type { ContactCategory, InfluenceType, MoodAfter } from '@/types/contacts'

const categoryConfig = {
    work: { label: 'Работа', color: 'bg-blue-500/10 text-blue-600' },
    friend: { label: 'Друг', color: 'bg-green-500/10 text-green-600' },
    family: { label: 'Семья', color: 'bg-purple-500/10 text-purple-600' },
    mentor: { label: 'Наставник', color: 'bg-orange-500/10 text-orange-600' },
    partner: { label: 'Партнёр', color: 'bg-pink-500/10 text-pink-600' },
    other: { label: 'Другое', color: 'bg-gray-500/10 text-gray-600' }
}

const influenceConfig = {
    positive: { label: 'Позитивное', icon: TrendingUp, color: 'text-green-600', bgColor: 'bg-green-500/10' },
    neutral: { label: 'Нейтральное', icon: Minus, color: 'text-blue-600', bgColor: 'bg-blue-500/10' },
    negative: { label: 'Негативное', icon: TrendingDown, color: 'text-red-600', bgColor: 'bg-red-500/10' }
}

const moodConfig = {
    better: { label: 'Лучше', color: 'text-green-600' },
    same: { label: 'Так же', color: 'text-blue-600' },
    worse: { label: 'Хуже', color: 'text-red-600' }
}

export default function ContactsPage() {
    const [showAddContact, setShowAddContact] = useState(false)
    const [showAddInteraction, setShowAddInteraction] = useState(false)
    const [showContactDetail, setShowContactDetail] = useState(false)
    const [selectedContact, setSelectedContact] = useState<string | null>(null)

    const [name, setName] = useState('')
    const [category, setCategory] = useState<ContactCategory>('friend')
    const [influenceType, setInfluenceType] = useState<InfluenceType>('positive')
    const [contactNotes, setContactNotes] = useState('')

    const [meetingDate, setMeetingDate] = useState('')
    const [durationHours, setDurationHours] = useState<number | undefined>(undefined) // 🆕
    const [interactionNotes, setInteractionNotes] = useState('')
    const [moodAfter, setMoodAfter] = useState<MoodAfter>('same')

    const { contacts, interactions, loading, loadContacts, loadInteractions, addContact, addInteraction } = useContacts()
    const [submitting, setSubmitting] = useState(false)

    const handleAddContact = async () => {
        if (!name.trim()) return

        setSubmitting(true)
        const { error } = await addContact({
            name: name.trim(),
            category,
            influence_type: influenceType,
            notes: contactNotes.trim() || undefined
        })

        if (!error) {
            setName('')
            setCategory('friend')
            setInfluenceType('positive')
            setContactNotes('')
            setShowAddContact(false)
        }
        setSubmitting(false)
    }

    const handleAddInteraction = async () => {
        if (!selectedContact || !meetingDate || !interactionNotes.trim()) return

        setSubmitting(true)
        const { error } = await addInteraction({
            contact_id: selectedContact,
            meeting_date: meetingDate,
            duration_hours: durationHours, // 🆕
            notes: interactionNotes.trim(),
            mood_after: moodAfter
        })

        if (!error) {
            setMeetingDate('')
            setDurationHours(undefined) // 🆕
            setInteractionNotes('')
            setMoodAfter('same')
            setShowAddInteraction(false)
            await loadInteractions(selectedContact)
        }
        setSubmitting(false)
    }

    const handleOpenContactDetail = async (contactId: string) => {
        setSelectedContact(contactId)
        await loadInteractions(contactId)
        setShowContactDetail(true)
    }

    const handleOpenAddInteraction = (contactId: string) => {
        setSelectedContact(contactId)
        setMeetingDate(new Date().toISOString().split('T')[0])
        setShowAddInteraction(true)
    }

    const selectedContactData = contacts.find(c => c.id === selectedContact)

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const getDaysAgo = (date: string) => {
        const days = Math.floor((Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
        if (days === 0) return 'Сегодня'
        if (days === 1) return 'Вчера'
        if (days < 7) return `${days} дн. назад`
        if (days < 30) return `${Math.floor(days / 7)} нед. назад`
        return `${Math.floor(days / 30)} мес. назад`
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
                                <Users className="w-8 h-8 text-primary" strokeWidth={2} />
                                <h1 className="text-3xl font-bold tracking-tight">Окружение</h1>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Отслеживайте влияние вашего окружения
                            </p>
                        </div>
                    </div>

                    <Card
                        onClick={() => setShowAddContact(true)}
                        className="p-6 cursor-pointer hover:shadow-lg transition-all border-dashed border-2 border-primary/30 hover:border-primary/50"
                    >
                        <div className="flex items-center justify-center gap-3 text-primary">
                            <Plus className="w-5 h-5" strokeWidth={2} />
                            <span className="font-medium">Добавить человека</span>
                        </div>
                    </Card>

                    {contacts.length > 0 && (
                        <div className="space-y-3">
                            {contacts.map((contact, index) => {
                                const influenceInfo = influenceConfig[contact.influence_type]
                                const InfluenceIcon = influenceInfo.icon
                                const categoryInfo = categoryConfig[contact.category]

                                return (
                                    <motion.div
                                        key={contact.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <Card className="p-5 hover:shadow-lg transition-all cursor-pointer group border-border/50">
                                            <div className="space-y-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <h3 className="font-semibold text-lg">{contact.name}</h3>
                                                            <span className={`text-xs px-2 py-0.5 rounded-full ${categoryInfo.color}`}>
                                                                {categoryInfo.label}
                                                            </span>
                                                        </div>
                                                        {contact.notes && (
                                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                                {contact.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${influenceInfo.bgColor}`}>
                                                        <InfluenceIcon className={`w-4 h-4 ${influenceInfo.color}`} strokeWidth={2} />
                                                        <span className={`text-xs font-medium ${influenceInfo.color}`}>
                                                            {influenceInfo.label}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-4">
                                                        {contact.last_interaction && (
                                                            <div className="flex items-center gap-1.5">
                                                                <Calendar className="w-3.5 h-3.5" />
                                                                <span>{getDaysAgo(contact.last_interaction)}</span>
                                                            </div>
                                                        )}
                                                        {contact.interaction_count !== undefined && (
                                                            <div className="flex items-center gap-1.5">
                                                                <MessageSquare className="w-3.5 h-3.5" />
                                                                <span>{contact.interaction_count} встреч</span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleOpenAddInteraction(contact.id)
                                                            }}
                                                            className="h-7 px-3 text-xs hover:bg-primary/10 hover:text-primary"
                                                        >
                                                            <Plus className="w-3.5 h-3.5 mr-1" />
                                                            Встреча
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleOpenContactDetail(contact.id)
                                                            }}
                                                            className="h-7 px-3 text-xs hover:bg-primary/10"
                                                        >
                                                            История
                                                        </Button>
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

            {/* Add Contact Dialog */}
            <Dialog open={showAddContact} onOpenChange={setShowAddContact}>
                <DialogContent>
                    <DialogHeader onClose={() => setShowAddContact(false)}>
                        <div>
                            <DialogTitle>Добавить человека</DialogTitle>
                            <DialogDescription>
                                Добавьте нового человека в ваше окружение
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <DialogBody>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Имя *</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Введите имя"
                                    className="w-full p-3 rounded-xl border-0 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Категория</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(categoryConfig).map(([key, config]) => (
                                        <button
                                            key={key}
                                            onClick={() => setCategory(key as ContactCategory)}
                                            className={`p-2 rounded-lg text-xs font-medium transition-all ${category === key ? config.color : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}
                                        >
                                            {config.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Тип влияния</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(influenceConfig).map(([key, config]) => {
                                        const Icon = config.icon
                                        return (
                                            <button
                                                key={key}
                                                onClick={() => setInfluenceType(key as InfluenceType)}
                                                className={`p-3 rounded-lg text-xs font-medium transition-all ${influenceType === key ? `${config.bgColor} ${config.color}` : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}
                                            >
                                                <Icon className="w-4 h-4 mx-auto mb-1" strokeWidth={2} />
                                                {config.label}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Заметки (опционально)</label>
                                <textarea
                                    value={contactNotes}
                                    onChange={(e) => setContactNotes(e.target.value)}
                                    placeholder="Дополнительная информация о человеке"
                                    className="w-full min-h-[100px] p-3 rounded-xl border-0 bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="ghost" onClick={() => setShowAddContact(false)} className="rounded-xl">
                                    Отмена
                                </Button>
                                <Button
                                    onClick={handleAddContact}
                                    disabled={submitting || !name.trim()}
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

            {/* Add Interaction Dialog */}
            <Dialog open={showAddInteraction} onOpenChange={setShowAddInteraction}>
                <DialogContent>
                    <DialogHeader onClose={() => setShowAddInteraction(false)}>
                        <div>
                            <DialogTitle>Добавить встречу</DialogTitle>
                            <DialogDescription>
                                {selectedContactData?.name && `Встреча с ${selectedContactData.name}`}
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <DialogBody>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Дата встречи *</label>
                                <input
                                    type="date"
                                    value={meetingDate}
                                    onChange={(e) => setMeetingDate(e.target.value)}
                                    max={new Date().toISOString().split('T')[0]}
                                    className="w-full p-3 rounded-xl border-0 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            {/* 🆕 НОВОЕ ПОЛЕ */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    ⏱️ Продолжительность (часов)
                                </label>
                                <input
                                    type="number"
                                    step="0.5"
                                    min="0"
                                    max="24"
                                    value={durationHours || ''}
                                    onChange={(e) => setDurationHours(e.target.value ? parseFloat(e.target.value) : undefined)}
                                    placeholder="Например: 2.5"
                                    className="w-full p-3 rounded-xl border-0 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    💡 Нужно для расчёта Shadow Cost
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Что делали / О чём говорили *</label>
                                <textarea
                                    value={interactionNotes}
                                    onChange={(e) => setInteractionNotes(e.target.value)}
                                    placeholder="Опишите встречу: где были, что обсуждали, какие инсайты получили..."
                                    className="w-full min-h-[120px] p-3 rounded-xl border-0 bg-muted/30 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Как вы себя чувствуете после встречи?</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(moodConfig).map(([key, config]) => (
                                        <button
                                            key={key}
                                            onClick={() => setMoodAfter(key as MoodAfter)}
                                            className={`p-3 rounded-lg text-xs font-medium transition-all ${moodAfter === key ? `${config.color} bg-primary/10` : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}`}
                                        >
                                            {config.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="ghost" onClick={() => setShowAddInteraction(false)} className="rounded-xl">
                                    Отмена
                                </Button>
                                <Button
                                    onClick={handleAddInteraction}
                                    disabled={submitting || !meetingDate || !interactionNotes.trim()}
                                    className="rounded-xl px-6 bg-gradient-to-r from-primary to-primary/80"
                                >
                                    {submitting ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Сохранение...
                                        </span>
                                    ) : (
                                        'Добавить встречу'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogBody>
                </DialogContent>
            </Dialog>

            {/* Contact Detail Dialog */}
            <Dialog open={showContactDetail} onOpenChange={setShowContactDetail}>
                <DialogContent>
                    <DialogHeader onClose={() => setShowContactDetail(false)}>
                        <div>
                            <DialogTitle>{selectedContactData?.name}</DialogTitle>
                            <DialogDescription>История всех встреч</DialogDescription>
                        </div>
                    </DialogHeader>

                    <DialogBody>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        ) : interactions.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageSquare className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" strokeWidth={1.5} />
                                <p className="text-muted-foreground mb-4">
                                    Встреч пока нет. Добавьте первую встречу.
                                </p>
                                <Button
                                    onClick={() => {
                                        setShowContactDetail(false)
                                        if (selectedContact) handleOpenAddInteraction(selectedContact)
                                    }}
                                    className="rounded-xl"
                                >
                                    Добавить встречу
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {interactions.map((interaction, index) => (
                                    <motion.div
                                        key={interaction.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.03 }}
                                    >
                                        <Card className="p-4 border-border/50">
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                        <Calendar className="w-3.5 h-3.5" />
                                                        <span>{formatDate(interaction.meeting_date)}</span>
                                                        {interaction.duration_hours && (
                                                            <>
                                                                <span>•</span>
                                                                <span>{interaction.duration_hours}ч</span>
                                                            </>
                                                        )}
                                                    </div>
                                                    {interaction.mood_after && (
                                                        <span className={`text-xs font-medium ${moodConfig[interaction.mood_after].color}`}>
                                                            {moodConfig[interaction.mood_after].label}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm leading-relaxed">{interaction.notes}</p>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </DialogBody>
                </DialogContent>
            </Dialog>
        </>
    )
}