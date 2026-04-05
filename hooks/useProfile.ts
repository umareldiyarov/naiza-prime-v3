'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, UpdateProfileData, QuickStats } from '@/types/profile'
import type { User } from '@supabase/supabase-js'

export function useProfile() {
    const [profile, setProfile] = useState<Profile | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [quickStats, setQuickStats] = useState<QuickStats | null>(null)
    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const supabase = createClient()


    // Загрузка профиля и пользователя
    const loadProfile = async () => {
        setLoading(true)
        try {
            const { data: { user: authUser }, error: authError } = await supabase.auth.getUser()

            if (authError) {
                console.error('Auth error:', authError)
                throw authError
            }

            if (!authUser) {
                console.error('No user found')
                throw new Error('Not authenticated')
            }

            setUser(authUser)

            // Загружаем профиль
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('user_id', authUser.id)
                .maybeSingle() // Используем maybeSingle вместо single

            if (profileError) {
                console.error('Profile error:', profileError)
                throw profileError
            }

            // Если профиля нет — создаём
            if (!profileData) {
                console.log('Creating new profile for user:', authUser.id)

                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert({
                        user_id: authUser.id,
                        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Пользователь'
                    })
                    .select()
                    .single()

                if (createError) {
                    console.error('Create profile error:', createError)
                    throw createError
                }

                console.log('Profile created:', newProfile)
                setProfile(newProfile)
            } else {
                console.log('Profile loaded:', profileData)
                setProfile(profileData)
            }
        } catch (error: any) {
            console.error('Error loading profile:', error.message || error)
        } finally {
            setLoading(false)
        }
    }


    // Загрузка быстрой статистики
    const loadQuickStats = async () => {
        try {
            const { data: { user }, error: authError } = await supabase.auth.getUser()

            if (authError || !user) {
                console.error('Auth error in quick stats:', authError)
                return
            }

            const [winsData, thoughtsData, goalsData, contactsData] = await Promise.all([
                supabase.from('wins').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
                supabase.from('thoughts').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
                supabase.from('goals').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
                supabase.from('contacts').select('id', { count: 'exact', head: true }).eq('user_id', user.id)
            ])

            console.log('Quick stats loaded:', {
                wins: winsData.count,
                thoughts: thoughtsData.count,
                goals: goalsData.count,
                contacts: contactsData.count
            })

            setQuickStats({
                wins: winsData.count || 0,
                thoughts: thoughtsData.count || 0,
                goals: goalsData.count || 0,
                contacts: contactsData.count || 0
            })
        } catch (error: any) {
            console.error('Error loading quick stats:', error.message || error)
        }
    }

    // Обновление профиля
    const updateProfile = async (data: UpdateProfileData) => {
        if (!profile) return { error: new Error('No profile loaded') }

        try {
            const { data: updatedProfile, error } = await supabase
                .from('profiles')
                .update({ ...data, updated_at: new Date().toISOString() })
                .eq('user_id', profile.user_id)
                .select()
                .single()

            if (error) throw error

            setProfile(updatedProfile)
            return { data: updatedProfile, error: null }
        } catch (error: any) {
            return { data: null, error }
        }
    }

    // Загрузка аватара
    const uploadAvatar = async (file: File) => {
        if (!user) return { error: new Error('Not authenticated') }

        setUploading(true)
        try {
            // Удаляем старый аватар если есть
            if (profile?.avatar_url) {
                const oldPath = profile.avatar_url.split('/').pop()
                if (oldPath) {
                    await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`])
                }
            }

            // Генерируем уникальное имя
            const fileExt = file.name.split('.').pop()
            const fileName = `${Date.now()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            // Загружаем новый файл
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) throw uploadError

            // Получаем публичный URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)

            // Обновляем профиль
            const { error: updateError } = await updateProfile({ avatar_url: publicUrl })

            if (updateError) throw updateError

            return { data: publicUrl, error: null }
        } catch (error: any) {
            return { data: null, error }
        } finally {
            setUploading(false)
        }
    }

    // Удаление аватара
    const deleteAvatar = async () => {
        if (!user || !profile?.avatar_url) return { error: new Error('No avatar to delete') }

        try {
            const oldPath = profile.avatar_url.split('/').pop()
            if (oldPath) {
                await supabase.storage.from('avatars').remove([`${user.id}/${oldPath}`])
            }

            const { error } = await updateProfile({ avatar_url: null })
            if (error) throw error

            return { error: null }
        } catch (error: any) {
            return { error }
        }
    }

    // Выход
    const signOut = async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
    }

    // Удаление аккаунта
    const deleteAccount = async () => {
        if (!user) return { error: new Error('Not authenticated') }

        try {
            // Удаляем аватар из storage
            if (profile?.avatar_url) {
                await deleteAvatar()
            }

            // Удаляем все данные пользователя (cascade удалит всё автоматически)
            const { error: deleteError } = await supabase
                .from('profiles')
                .delete()
                .eq('user_id', user.id)

            if (deleteError) throw deleteError

            // Удаляем auth пользователя (требует admin права, нужно использовать Edge Function)
            // Пока просто выходим
            await signOut()

            return { error: null }
        } catch (error: any) {
            return { error }
        }
    }

    useEffect(() => {
        loadProfile()
        loadQuickStats()
    }, [])

    return {
        profile,
        user,
        quickStats,
        loading,
        uploading,
        loadProfile,
        loadQuickStats,
        updateProfile,
        uploadAvatar,
        deleteAvatar,
        signOut,
        deleteAccount
    }
}