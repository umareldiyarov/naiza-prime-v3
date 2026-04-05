'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from './theme-provider'
import { motion } from 'framer-motion'

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme()

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2 rounded-xl hover:bg-muted transition-colors"
            aria-label="Переключить тему"
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.3 }}
            >
                {theme === 'light' ? (
                    <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                    <Sun className="w-5 h-5 text-primary" />
                )}
            </motion.div>
        </motion.button>
    )
}