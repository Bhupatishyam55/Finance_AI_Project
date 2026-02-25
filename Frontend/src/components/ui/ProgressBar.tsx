'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  progress: number
  variant?: 'default' | 'primary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  animated?: boolean
}

const variants = {
  default: 'bg-slate-500',
  primary: 'bg-primary-500',
  danger: 'bg-danger-500',
  success: 'bg-success-500',
}

const sizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
}

export function ProgressBar({
  progress,
  variant = 'primary',
  size = 'md',
  showLabel = false,
  animated = true,
}: ProgressBarProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress))

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-sm mb-2">
          <span className="text-slate-500">Progress</span>
          <span className="text-slate-800 font-medium">{Math.round(clampedProgress)}%</span>
        </div>
      )}
      <div className={cn('w-full bg-slate-200 rounded-sm overflow-hidden', sizes[size])}>
        <div
          className={cn(
            'h-full rounded-sm transition-all duration-500 ease-out',
            variants[variant]
          )}
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  )
}
