'use client'

/**
 * AboutApp
 * 
 * Кнопка и модальное окно с информацией о приложении:
 * - Философия проекта (зачем фиксировать победы)
 * - Личная философия автора
 * - Как правильно писать победы
 * - Безопасность данных
 * - Инструкция по установке PWA
 * - Информация об авторе
 */

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
    Info,
    Trophy,
    Shield,
    Gift,
    Heart,
    CheckCircle2,
    X,
    Smartphone,
    Monitor
} from 'lucide-react'

export function AboutApp() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Кнопка открытия */}
            <Card className="p-4">
                <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setIsOpen(true)}
                >
                    <Info className="w-5 h-5 mr-3" strokeWidth={2} />
                    <div className="text-left">
                        <p className="font-semibold">О приложении</p>
                        <p className="text-xs text-muted-foreground">
                            Философия, безопасность и установка
                        </p>
                    </div>
                </Button>
            </Card>

            {/* Модальное окно */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-2xl font-bold">О NAIZA PRIME</DialogTitle>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="rounded-full"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 pt-4">
                        {/* Зачем фиксировать победы */}
                        <Card className="p-6 space-y-4 bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                            <div className="flex items-start gap-3">
                                <Trophy className="w-6 h-6 text-primary shrink-0 mt-1" strokeWidth={2} />
                                <div className="space-y-3">
                                    <h3 className="font-bold text-lg">Зачем фиксировать победы?</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Мы живём в мире, где мозг по умолчанию фокусируется на проблемах.
                                        Каждый вечер воспоминания о неудачах перевешивают достижения —
                                        даже если день был продуктивным.
                                    </p>
                                    <p className="text-sm leading-relaxed">
                                        <strong>Маленькие победы рождают больших.</strong> Человек, который
                                        ежедневно фиксирует даже небольшой прогресс, через год становится
                                        другим человеком. Не потому что совершил подвиг — а потому что не остановился.
                                    </p>
                                    <p className="text-sm text-muted-foreground italic">
                                        NAIZA PRIME — это твой личный журнал роста. Здесь нет соцсетей,
                                        нет сравнений, нет лайков. Только ты и твой путь.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Личная философия автора */}
                        <Card className="p-6 space-y-4 bg-gradient-to-br from-amber-500/5 to-transparent border-amber-500/20">
                            <div className="flex items-start gap-3">
                                <Heart className="w-6 h-6 text-amber-600 shrink-0 mt-1 fill-amber-600/20" strokeWidth={2} />
                                <div className="space-y-3">
                                    <h3 className="font-bold text-lg">Философия автора</h3>
                                    <blockquote className="border-l-4 border-amber-500 pl-4 py-2 bg-amber-500/5 rounded-r">
                                        <p className="text-base leading-relaxed italic font-medium">
                                            "Если моя жизнь изменит хоть бы одну судьбу к лучшему —
                                            значит я прожил её не зря"
                                        </p>
                                        <footer className="text-sm text-muted-foreground mt-2">
                                            — Умар Элдияров
                                        </footer>
                                    </blockquote>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Именно поэтому NAIZA PRIME создан и доступен бесплатно.
                                        Это мой вклад в твой рост и развитие.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Как писать победы */}
                        <Card className="p-6 space-y-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 className="w-6 h-6 text-green-600 shrink-0 mt-1" strokeWidth={2} />
                                <div className="space-y-3">
                                    <h3 className="font-bold text-lg">Как писать победы правильно?</h3>
                                    <p className="text-sm text-muted-foreground">
                                        Победа — это не обязательно что-то грандиозное. Примеры:
                                    </p>
                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-600 shrink-0">✅</span>
                                            <span>Сделал зарядку утром</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-600 shrink-0">✅</span>
                                            <span>Не отвлекался на телефон 2 часа</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-600 shrink-0">✅</span>
                                            <span>Прочитал 10 страниц книги</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-600 shrink-0">✅</span>
                                            <span>Сказал «нет» тому, что не хотел</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-600 shrink-0">✅</span>
                                            <span>Лёг спать вовремя</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Card>

                        {/* Безопасность */}
                        <Card className="p-6 space-y-4 bg-blue-500/5 border-blue-500/20">
                            <div className="flex items-start gap-3">
                                <Shield className="w-6 h-6 text-blue-600 shrink-0 mt-1" strokeWidth={2} />
                                <div className="space-y-3">
                                    <h3 className="font-bold text-lg">Твои данные в безопасности</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Все твои записи изолированы и защищены. Каждый пользователь видит
                                        только свои данные — это гарантируется на уровне базы данных
                                        (Row Level Security). Никто другой — ни другие пользователи,
                                        ни третьи лица — не имеет доступа к твоим записям.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Бесплатно */}
                        <Card className="p-6 space-y-4 bg-green-500/5 border-green-500/20">
                            <div className="flex items-start gap-3">
                                <Gift className="w-6 h-6 text-green-600 shrink-0 mt-1" strokeWidth={2} />
                                <div className="space-y-3">
                                    <h3 className="font-bold text-lg">100% бесплатно</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Приложение полностью бесплатное. Без рекламы, без подписок,
                                        без скрытых платежей. Просто инструмент для твоего роста.
                                    </p>
                                </div>
                            </div>
                        </Card>

                        {/* Установка PWA */}
                        <Card className="p-6 space-y-4">
                            <h3 className="font-bold text-lg">📱 Установи как приложение</h3>

                            {/* Android */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Smartphone className="w-5 h-5 text-green-600" strokeWidth={2} />
                                    <h4 className="font-semibold">Android</h4>
                                </div>
                                <ol className="text-sm text-muted-foreground space-y-1.5 pl-6">
                                    <li>1. Открой меню браузера (⋮)</li>
                                    <li>2. Нажми "Добавить на главный экран"</li>
                                    <li>3. Готово! Теперь это полноценное приложение</li>
                                </ol>
                            </div>

                            {/* iOS */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Monitor className="w-5 h-5 text-blue-600" strokeWidth={2} />
                                    <h4 className="font-semibold">iOS (iPhone/iPad)</h4>
                                </div>
                                <ol className="text-sm text-muted-foreground space-y-1.5 pl-6">
                                    <li>1. Нажми кнопку "Поделиться" (□↑)</li>
                                    <li>2. Выбери "На экран Домой"</li>
                                    <li>3. Готово! Работает как нативное приложение</li>
                                </ol>
                            </div>

                            <div className="pt-3 border-t">
                                <p className="text-sm text-muted-foreground">
                                    💡 <span className="font-medium">Совет:</span> Используй каждый день для максимального эффекта!
                                </p>
                            </div>
                        </Card>

                        {/* Footer */}
                        <div className="pt-4 border-t text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Версия 2.0 · NAIZA PRIME
                            </p>
                            <p className="text-sm flex items-center justify-center gap-1.5">
                                <span className="text-muted-foreground">Автор проекта:</span>
                                <span className="font-semibold">Умар Элдияров</span>
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                                Сделано с <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}