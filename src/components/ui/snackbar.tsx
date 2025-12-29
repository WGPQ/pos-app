'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SnackbarProps {
  open: boolean
  message: string
  variant?: "success" | "error"
  duration?: number
  onClose: () => void
}

const Snackbar = ({
  open,
  message,
  variant = "success",
  duration = 3000,
  onClose,
}: SnackbarProps) => {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  const accent = variant === "success" ? "bg-success-500" : "bg-error-500";
  const border = variant === "success" ? "border-success-100" : "border-error-100";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border bg-white px-4 py-3 text-sm text-gray-700 shadow-theme-lg",
        "animate-in fade-in-0 slide-in-from-bottom-2",
        border
      )}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${accent}`} />
      <span className="font-medium">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="ml-2 text-gray-400 hover:text-gray-600"
        aria-label="Cerrar notificación"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export default Snackbar
