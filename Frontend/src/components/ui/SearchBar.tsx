'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface SearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
  debounceMs?: number
  className?: string
}

export function SearchBar({
  placeholder = 'Search documents, invoices, reports...',
  onSearch,
  debounceMs = 300,
  className,
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const router = useRouter()


  // Debounce search
  useEffect(() => {
    if (!onSearch) return

    const timer = setTimeout(() => {
      onSearch(query)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [query, debounceMs, onSearch])

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query)}`)
      }
    },
    [query, router]
  )

  const clearSearch = useCallback(() => {
    setQuery('')
    if (onSearch) {
      onSearch('')
    }
  }, [onSearch])

  return (
    <form onSubmit={handleSubmit} className={cn('relative', className)}>
      <div
        className={cn(
          'relative flex items-center transition-all duration-200',
          isFocused && 'ring-2 ring-primary-500 rounded-md'
        )}
      >
        <Search
          className="absolute left-3 w-5 h-5 text-slate-400 pointer-events-none"
          aria-hidden="true"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 bg-white border border-slate-300 rounded-md text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-primary-500 transition-colors duration-200"
          aria-label="Search"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </form>
  )
}
