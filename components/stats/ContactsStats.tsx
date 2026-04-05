'use client'

import { Card } from '@/components/ui/card'
import { Users, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { Contact, Interaction } from '@/types/contacts'

interface ContactsStatsProps {
    contacts: Contact[]
    interactions: Interaction[]
}

export function ContactsStats({ contacts, interactions }: ContactsStatsProps) {
    const positive = contacts.filter(c => c.influence_type === 'positive').length
    const neutral = contacts.filter(c => c.influence_type === 'neutral').length
    const negative = contacts.filter(c => c.influence_type === 'negative').length

    // Топ-5 по встречам
    const topContacts = contacts
        .map(c => ({
            name: c.name,
            count: interactions.filter(i => i.contact_id === c.id).length
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

    return (
        <div className="space-y-6">
            <Card className="p-4">
                <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-primary" strokeWidth={2} />
                    <div>
                        <p className="text-2xl font-bold">{contacts.length}</p>
                        <p className="text-sm text-muted-foreground">Всего контактов</p>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <h3 className="font-semibold mb-4">Распределение по влиянию</h3>
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            Позитивное
                        </span>
                        <span className="font-semibold text-green-600">{positive}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2">
                            <Minus className="w-4 h-4 text-blue-600" />
                            Нейтральное
                        </span>
                        <span className="font-semibold text-blue-600">{neutral}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm flex items-center gap-2">
                            <TrendingDown className="w-4 h-4 text-red-600" />
                            Негативное
                        </span>
                        <span className="font-semibold text-red-600">{negative}</span>
                    </div>
                </div>
            </Card>

            {topContacts.length > 0 && (
                <Card className="p-6">
                    <h3 className="font-semibold mb-4">Топ-5 по встречам</h3>
                    <div className="space-y-3">
                        {topContacts.map((contact, index) => (
                            <div key={index} className="flex items-center justify-between">
                                <span className="text-sm">{contact.name}</span>
                                <span className="font-semibold">{contact.count} встреч</span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    )
}