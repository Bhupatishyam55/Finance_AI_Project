'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  variant?: 'default' | 'primary' | 'danger' | 'success'
}

const variants = {
  default: {
    icon: 'bg-slate-100 text-slate-600',
    border: 'border-slate-200',
  },
  primary: {
    icon: 'bg-primary-50 text-primary-600',
    border: 'border-primary-100',
  },
  danger: {
    icon: 'bg-danger-50 text-danger-600',
    border: 'border-danger-100',
  },
  success: {
    icon: 'bg-success-50 text-success-600',
    border: 'border-success-100',
  },
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = 'default',
}: StatsCardProps) {
  const style = variants[variant]

  return (
    <div
      className={cn(
        'bg-white border rounded-md p-5 transition-shadow duration-200 hover:shadow-md',
        style.border
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={cn('p-2.5 rounded-md', style.icon)}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <div
            className={cn(
              'flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded',
              trend.isPositive
                ? 'text-success-700 bg-success-50'
                : 'text-danger-700 bg-danger-50'
            )}
          >
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>

      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
      {subtitle && (
        <p className="text-slate-400 text-sm mt-1">{subtitle}</p>
      )}
    </div>
  )
}
