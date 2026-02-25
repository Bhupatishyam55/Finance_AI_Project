'use client'

import React, { useState } from 'react'
import { Bell, ChevronDown, User, LogOut, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SearchBar } from '@/components/ui/SearchBar'

const notifications = [
  {
    id: '1',
    title: 'Critical Alert',
    message: 'High fraud score detected in Invoice #5521',
    time: '2 min ago',
    type: 'error',
    unread: true,
  },
  {
    id: '2',
    title: 'Scan Complete',
    message: '23 documents processed successfully',
    time: '15 min ago',
    type: 'success',
    unread: true,
  },
  {
    id: '3',
    title: 'Weekly Report',
    message: 'Your weekly fraud detection report is ready',
    time: '1 hour ago',
    type: 'info',
    unread: false,
  },
]

export function Header() {
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <header className="hidden md:flex fixed top-0 left-64 right-0 h-16 bg-white border-b border-slate-200 z-30 items-center justify-between px-6">
      {/* Search Bar */}
      <div className="flex-1 max-w-xl hidden lg:block">
        <SearchBar
          placeholder="Search documents, invoices, reports..."
          onSearch={(query) => {
            console.log('Searching for:', query)
          }}
        />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Data Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-success-50 rounded-md border border-success-200">
          <div className="w-2 h-2 bg-success-500 rounded-full" />
          <span className="text-sm text-success-700 font-medium">
            System Online
          </span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfile(false)
            }}
            className="relative p-2 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors duration-200"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5 text-slate-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-md shadow-md overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      'p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors',
                      notif.unread && 'bg-primary-50/50'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                          notif.type === 'error' && 'bg-danger-500',
                          notif.type === 'success' && 'bg-success-500',
                          notif.type === 'info' && 'bg-primary-500'
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-800 text-sm">{notif.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{notif.message}</p>
                        <p className="text-xs text-slate-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-t border-slate-200 bg-slate-50">
                <button className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View All Notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfile(!showProfile)
              setShowNotifications(false)
            }}
            className="flex items-center gap-3 p-2 pr-3 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors duration-200"
          >
            <div className="w-8 h-8 bg-primary-500 rounded-md flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-800">Admin User</p>
              <p className="text-xs text-slate-500">Finance Dept.</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {/* Profile Dropdown */}
          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-md shadow-md overflow-hidden animate-fade-in">
              <div className="p-4 border-b border-slate-200 bg-slate-50">
                <p className="font-semibold text-slate-800">Admin User</p>
                <p className="text-sm text-slate-500">admin@apfinance.gov.in</p>
              </div>
              <div className="p-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-slate-600 hover:bg-slate-50 rounded-md transition-colors">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-danger-600 hover:bg-danger-50 rounded-md transition-colors">
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
