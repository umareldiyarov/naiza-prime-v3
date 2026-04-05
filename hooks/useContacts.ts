'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client' // 🔧 ПРАВИЛЬНЫЙ ИМПОРТ
import type { Contact, Interaction, CreateContactData, CreateInteractionData } from '@/types/contacts'

const supabase = createClient() // 🔧 СОЗДАЁМ КЛИЕНТ

export function useContacts() {
    const [contacts, setContacts] = useState<Contact[]>([])
    const [interactions, setInteractions] = useState<Interaction[]>([])
    const [loading, setLoading] = useState(false)

    const loadContacts = async () => {
        setLoading(true)
        try {
            const { data: contactsData, error: contactsError } = await supabase
                .from('contacts')
                .select('*')
                .order('updated_at', { ascending: false })

            if (contactsError) throw contactsError

            const contactsWithStats = await Promise.all(
                (contactsData || []).map(async (contact) => {
                    const { data: interactionsData } = await supabase
                        .from('interactions')
                        .select('meeting_date')
                        .eq('contact_id', contact.id)
                        .order('meeting_date', { ascending: false })

                    return {
                        ...contact,
                        last_interaction: interactionsData?.[0]?.meeting_date,
                        interaction_count: interactionsData?.length || 0
                    }
                })
            )

            setContacts(contactsWithStats)
            return { data: contactsWithStats, error: null }
        } catch (error) {
            console.error('Error loading contacts:', error)
            return { data: null, error }
        } finally {
            setLoading(false)
        }
    }

    const loadInteractions = async (contactId: string) => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('interactions')
                .select('*')
                .eq('contact_id', contactId)
                .order('meeting_date', { ascending: false })

            if (error) throw error

            setInteractions(data || [])
            return { data: data || [], error: null }
        } catch (error) {
            console.error('Error loading interactions:', error)
            return { data: null, error }
        } finally {
            setLoading(false)
        }
    }

    const addContact = async (contactData: CreateContactData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('contacts')
                .insert([{
                    ...contactData,
                    user_id: user.id
                }])
                .select()
                .single()

            if (error) throw error

            await loadContacts()
            return { data, error: null }
        } catch (error) {
            console.error('Error adding contact:', error)
            return { data: null, error }
        }
    }

    const addInteraction = async (interactionData: CreateInteractionData) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            const { data, error } = await supabase
                .from('interactions')
                .insert([{
                    ...interactionData,
                    user_id: user.id
                }])
                .select()
                .single()

            if (error) throw error

            await loadContacts()
            return { data, error: null }
        } catch (error) {
            console.error('Error adding interaction:', error)
            return { data: null, error }
        }
    }

    useEffect(() => {
        loadContacts()
    }, [])

    return {
        contacts,
        interactions,
        loading,
        loadContacts,
        loadInteractions,
        addContact,
        addInteraction
    }
}