'use client'

import React, { useState } from 'react'
import { Filter, X, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FilterOption = {
  id: string
  label: string
  value: string | number
}

export type FilterGroup = {
  id: string
  label: string
  options: FilterOption[]
  type?: 'single' | 'multiple'
}

interface FilterPanelProps {
  filters: FilterGroup[]
  onFilterChange?: (filters: Record<string, string[]>) => void
  className?: string
}

export function FilterPanel({ filters, onFilterChange, className }: FilterPanelProps) {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({})
  const [isOpen, setIsOpen] = useState(false)

  const handleFilterToggle = (groupId: string, value: string, type: 'single' | 'multiple' = 'multiple') => {
    setSelectedFilters((prev) => {
      const current = prev[groupId] || []
      let newValues: string[]

      if (type === 'single') {
        newValues = current.includes(value) ? [] : [value]
      } else {
        newValues = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value]
      }

      const updated: Record<string, string[]> = { ...prev }

      if (newValues.length > 0) {
        updated[groupId] = newValues
      } else {
        delete updated[groupId]
      }

      if (onFilterChange) {
        onFilterChange(updated)
      }

      return updated
    })
  }

  const clearFilters = () => {
    setSelectedFilters({})
    if (onFilterChange) {
      onFilterChange({})
    }
  }

  const activeFilterCount = Object.values(selectedFilters).reduce(
    (sum, values) => sum + (values?.length || 0),
    0
  )

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 rounded-md text-slate-600 hover:text-slate-800 hover:border-slate-400 transition-colors duration-200"
        aria-label="Toggle filters"
      >
        <Filter className="w-4 h-4" />
        <span className="text-sm">Filters</span>
        {activeFilterCount > 0 && (
          <span className="px-2 py-0.5 bg-primary-500 text-white text-xs font-bold rounded">
            {activeFilterCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-md shadow-md z-50 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-800">Filter Options</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="Close filters"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-5 max-h-96 overflow-y-auto">
              {filters.map((group) => (
                <div key={group.id}>
                  <h4 className="text-sm font-medium text-slate-600 mb-3">{group.label}</h4>
                  <div className="space-y-2">
                    {group.options.map((option) => {
                      const isSelected = selectedFilters[group.id]?.includes(String(option.value))
                      return (
                        <button
                          key={option.id}
                          onClick={() =>
                            handleFilterToggle(group.id, String(option.value), group.type)
                          }
                          className={cn(
                            'w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors text-left text-sm',
                            isSelected
                              ? 'bg-primary-50 border border-primary-200 text-primary-700'
                              : 'bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                          )}
                        >
                          <span>{option.label}</span>
                          {isSelected && <Check className="w-4 h-4" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="w-full mt-4 px-4 py-2 text-sm text-danger-600 hover:text-danger-700 hover:bg-danger-50 rounded-md transition-colors border border-danger-200"
              >
                Clear All Filters
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
