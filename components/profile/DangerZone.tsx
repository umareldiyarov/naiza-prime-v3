'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogBody
} from '@/components/ui/dialog'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface DangerZoneProps {
    onDeleteAccount: () => Promise<void>
}

export function DangerZone({ onDeleteAccount }: DangerZoneProps) {
    const [showConfirm, setShowConfirm] = useState(false)
    const [confirmText, setConfirmText] = useState('')
    const [deleting, setDeleting] = useState(false)

    const handleDelete = async () => {
        if (confirmText !== 'DELETE') return

        setDeleting(true)
        await onDeleteAccount()
        setDeleting(false)
    }

    return (
        <>
            <div className="space-y-3">
                <h3 className="font-semibold text-lg text-red-600">⚠️ Опасная зона</h3>

                <Card className="p-5 border-red-500/20 bg-red-500/5">
                    <div className="space-y-3">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" strokeWidth={2} />
                            <div className="flex-1">
                                <h4 className="font-semibold text-red-600 mb-1">Удалить аккаунт</h4>
                                <p className="text-sm text-muted-foreground">
                                    Это действие необратимо. Все ваши данные будут удалены навсегда.
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="destructive"
                            onClick={() => setShowConfirm(true)}
                            className="w-full"
                        >
                            Удалить аккаунт
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Диалог подтверждения */}
            <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
                <DialogContent>
                    <DialogHeader onClose={() => setShowConfirm(false)}>
                        <div>
                            <DialogTitle className="text-red-600">Удалить аккаунт?</DialogTitle>
                            <DialogDescription>
                                Это действие нельзя отменить
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <DialogBody>
                        <div className="space-y-4">
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <p className="text-sm text-muted-foreground mb-3">
                                    Будет удалено:
                                </p>
                                <ul className="text-sm space-y-1 text-muted-foreground">
                                    <li>• Все победы</li>
                                    <li>• Все мысли</li>
                                    <li>• Все цели</li>
                                    <li>• Все контакты и встречи</li>
                                    <li>• Весь профиль</li>
                                </ul>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Введите <span className="font-bold text-red-600">DELETE</span> для подтверждения
                                </label>
                                <input
                                    type="text"
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value)}
                                    placeholder="DELETE"
                                    className="w-full p-3 rounded-xl border-0 bg-muted/30 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        setShowConfirm(false)
                                        setConfirmText('')
                                    }}
                                    className="rounded-xl"
                                >
                                    Отмена
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleDelete}
                                    disabled={confirmText !== 'DELETE' || deleting}
                                    className="rounded-xl px-6"
                                >
                                    {deleting ? (
                                        <span className="flex items-center gap-2">
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Удаление...
                                        </span>
                                    ) : (
                                        'Удалить навсегда'
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogBody>
                </DialogContent>
            </Dialog>
        </>
    )
}