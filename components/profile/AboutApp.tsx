'use client'

import { Card } from '@/components/ui/card'
import { Smartphone, Monitor } from 'lucide-react'

export function AboutApp() {
    return (
        <div className="space-y-3">
            <h3 className="font-semibold text-lg">ℹ️ О приложении</h3>

            <Card className="p-5 space-y-4">
                {/* Описание */}
                <div>
                    <h4 className="font-semibold mb-2">📖 NAIZA PRIME</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Твой личный дневник прогресса и саморазвития.
                    </p>
                </div>

                {/* Польза */}
                <div>
                    <h4 className="font-semibold mb-2">✨ Почему это работает?</h4>
                    <ul className="text-sm text-muted-foreground space-y-1.5">
                        <li>• Фиксируй победы — даже самые маленькие</li>
                        <li>• Отслеживай мысли и эмоции</li>
                        <li>• Анализируй влияние окружения</li>
                        <li>• Достигай целей пошагово</li>
                        <li>• Получай умную аналитику прогресса</li>
                    </ul>
                </div>

                {/* Установка Android */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="w-4 h-4 text-green-600" />
                        <h4 className="font-semibold">Android</h4>
                    </div>
                    <ol className="text-sm text-muted-foreground space-y-1 pl-4">
                        <li>1. Открой меню браузера (⋮)</li>
                        <li>2. Нажми "Добавить на главный экран"</li>
                        <li>3. Готово! Теперь это полноценное приложение</li>
                    </ol>
                </div>

                {/* Установка iOS */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <Monitor className="w-4 h-4 text-blue-600" />
                        <h4 className="font-semibold">iOS (iPhone/iPad)</h4>
                    </div>
                    <ol className="text-sm text-muted-foreground space-y-1 pl-4">
                        <li>1. Нажми кнопку "Поделиться" (□↑)</li>
                        <li>2. Выбери "На экран Домой"</li>
                        <li>3. Готово! Работает как нативное приложение</li>
                    </ol>
                </div>

                {/* Совет */}
                <div className="pt-3 border-t border-border">
                    <p className="text-sm text-muted-foreground">
                        💡 <span className="font-medium">Совет:</span> Используй каждый день для максимального эффекта!
                    </p>
                </div>

                {/* Версия */}
                <div className="text-xs text-muted-foreground text-center pt-2">
                    Версия 1.0.0
                </div>
            </Card>
        </div>
    )
}