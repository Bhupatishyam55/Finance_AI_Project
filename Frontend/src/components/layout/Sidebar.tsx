'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Upload,
  FileSearch,
  Settings,
  Shield,
  HelpCircle,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/upload', label: 'Upload Documents', icon: Upload },
  { href: '/results/demo', label: 'Analysis Results', icon: FileSearch },
]

const bottomNavItems = [
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/help', label: 'Help & Support', icon: HelpCircle },
]

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps = {}) {
  const pathname = usePathname()

  const handleLinkClick = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <aside className="hidden md:flex fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-200 z-40 flex-col">
      {/* Logo Section */}
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-500 rounded-md flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-base text-slate-900">AP FraudShield</h1>
            <p className="text-xs text-slate-500">Finance Department</p>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
          Main Menu
        </p>

        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors duration-200',
                isActive
                  ? 'bg-primary-50 text-primary-700 font-medium border-l-3 border-primary-500'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <Icon className={cn('w-5 h-5', isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600')} />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto text-primary-600" />}
            </Link>
          )
        })}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-slate-200">
        {bottomNavItems.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={handleLinkClick}
              className="flex items-center gap-3 px-3 py-2 text-slate-500 rounded-md hover:bg-slate-100 hover:text-slate-700 transition-colors duration-200"
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm">{item.label}</span>
            </Link>
          )
        })}
      </div>

      {/* Government Branding */}
      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 border border-slate-200 rounded-md p-4 text-center">
          <p className="text-xs text-slate-500">An Initiative of</p>
          <p className="font-semibold text-primary-600 text-sm mt-1">
            Government of Andhra Pradesh
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Finance Department</p>
        </div>
      </div>
    </aside>
  )
}
