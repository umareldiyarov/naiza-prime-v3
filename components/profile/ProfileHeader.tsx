'use client'

import { useState, useRef } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Loader2, X, Check, Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Profile, UpdateProfileData } from '@/types/profile'
import type { User } from '@supabase/supabase-js'

interface ProfileHeaderProps {
    profile: Profile
    user: User
    uploading: boolean
    onUploadAvatar: (file: File) => Promise<void>
    onDeleteAvatar: () => Promise<void>
    onUpdateProfile: (data: UpdateProfileData) => Promise<void>
}

export function ProfileHeader({
    profile,
    user,
    uploading,
    onUploadAvatar,
    onDeleteAvatar,
    onUpdateProfile
}: ProfileHeaderProps) {
    const [editingName, setEditingName] = useState(false)
    const [name, setName] = useState(profile.name || '')
    const [saving, setSaving] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Проверка размера (макс 2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert('Файл слишком большой. Максимум 2MB')
            return
        }

        // Проверка типа
        if (!file.type.startsWith('image/')) {
            alert('Можно загружать только изображения')
            return
        }

        await onUploadAvatar(file)
    }

    const handleSaveName = async () => {
        if (!name.trim() || name === profile.name) {
            setEditingName(false)
            return
        }

        setSaving(true)
        await onUpdateProfile({ name: name.trim() })
        setSaving(false)
        setEditingName(false)
    }

    const getInitials = () => {
        const displayName = profile.name || user.email || 'U'
        return displayName.charAt(0).toUpperCase()
    }

    return (
        <Card className="p-6">
            <div className="flex items-start gap-6">
                {/* Аватар */}
                <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {profile.avatar_url ? (
                            <img
                                src={profile.avatar_url}
                                alt="Avatar"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            getInitials()
                        )}
                    </div>

                    {/* Кнопка смены аватара */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        {uploading ? (
                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                        ) : (
                            <Camera className="w-6 h-6 text-white" />
                        )}
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {/* Кнопка удаления аватара */}
                    {profile.avatar_url && (
                        <button
                            onClick={onDeleteAvatar}
                            className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white shadow-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Информация */}
                <div className="flex-1 space-y-3">
                    {/* Имя */}
                    <div>
                        {editingName ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                                    className="flex-1 px-3 py-1.5 rounded-lg border-0 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    autoFocus
                                />
                                <Button
                                    size="sm"
                                    onClick={handleSaveName}
                                    disabled={saving}
                                    className="h-8 w-8 p-0"
                                >
                                    {saving ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Check className="w-4 h-4" />
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => {
                                        setName(profile.name || '')
                                        setEditingName(false)
                                    }}
                                    className="h-8 w-8 p-0"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <h2 className="text-2xl font-bold">
                                    {profile.name || 'Без имени'}
                                </h2>
                                <button
                                    onClick={() => setEditingName(true)}
                                    className="p-1.5 rounded-lg hover:bg-muted/50 transition-colors"
                                >
                                    <Pencil className="w-4 h-4 text-muted-foreground" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Email */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{user.email}</span>
                    </div>

                    {/* Дата регистрации */}
                    <div className="text-xs text-muted-foreground">
                        Зарегистрирован: {new Date(profile.created_at).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                        })}
                    </div>
                </div>
            </div>
        </Card>
    )
}