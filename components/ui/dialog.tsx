'use client'

import * as React from 'react'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface DialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    children: React.ReactNode
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
    React.useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onOpenChange(false)
        }
        if (open) {
            document.addEventListener('keydown', handleEscape)
            document.body.style.overflow = 'hidden'
        }
        return () => {
            document.removeEventListener('keydown', handleEscape)
            document.body.style.overflow = 'unset'
        }
    }, [open, onOpenChange])

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => onOpenChange(false)}
                        className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
                    />
                    {/* Dialog */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', bounce: 0.3, duration: 0.5 }}
                            className="relative w-full max-w-2xl max-h-[85vh] overflow-hidden"
                        >
                            {children}
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export function DialogContent({ children, className, ...props }: DialogContentProps) {
    return (
        <div
            className={cn(
                'glass rounded-3xl shadow-2xl border border-border/50 overflow-hidden',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    onClose?: () => void
}

export function DialogHeader({ children, onClose, className, ...props }: DialogHeaderProps) {
    return (
        <div
            className={cn(
                'flex items-center justify-between p-6 border-b border-border/50',
                className
            )}
            {...props}
        >
            <div className="flex-1">{children}</div>
            {onClose && (
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-muted rounded-xl transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            )}
        </div>
    )
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
    children: React.ReactNode
}

export function DialogTitle({ children, className, ...props }: DialogTitleProps) {
    return (
        <h2
            className={cn('text-2xl font-bold tracking-tight', className)}
            {...props}
        >
            {children}
        </h2>
    )
}

interface DialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
    children: React.ReactNode
}

export function DialogDescription({ children, className, ...props }: DialogDescriptionProps) {
    return (
        <p
            className={cn('text-sm text-muted-foreground mt-1', className)}
            {...props}
        >
            {children}
        </p>
    )
}

interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

export function DialogBody({ children, className, ...props }: DialogBodyProps) {
    return (
        <div
            className={cn('p-6 overflow-y-auto max-h-[calc(85vh-140px)]', className)}
            {...props}
        >
            {children}
        </div>
    )
}