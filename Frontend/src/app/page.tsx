'use client'

import React, { useEffect, useState } from 'react'
import { FileSearch, AlertTriangle, IndianRupee, Clock, TrendingUp, Shield, Database } from 'lucide-react'
import { StatsCard } from '@/components/ui/StatsCard'
import { DashboardChart } from '@/features/dashboard/DashboardChart'
import { LiveFeed } from '@/features/dashboard/LiveFeed'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { FilterPanel, type FilterGroup } from '@/components/ui/FilterPanel'
import { ExportButton } from '@/components/ui/ExportButton'
import { fetchDashboardStats, type DashboardStats } from '@/lib/api'
import { formatCurrency, formatNumber } from '@/lib/utils'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<Record<string, string[]>>({})

  const filterOptions: FilterGroup[] = [
    {
      id: 'severity',
      label: 'Severity',
      type: 'multiple',
      options: [
        { id: 'safe', label: 'Safe', value: 'safe' },
        { id: 'warning', label: 'Warning', value: 'warning' },
        { id: 'critical', label: 'Critical', value: 'critical' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      type: 'multiple',
      options: [
        { id: 'completed', label: 'Completed', value: 'completed' },
        { id: 'pending', label: 'Pending', value: 'pending' },
        { id: 'processing', label: 'Processing', value: 'processing' },
      ],
    },
  ]

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await fetchDashboardStats()
        setStats(data)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setIsLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Dashboard' }]} />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm md:text-base text-slate-500 mt-1">
            Real-time monitoring of document validation and fraud detection
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <FilterPanel filters={filterOptions} onFilterChange={setFilters} />
          {stats && <ExportButton data={stats} filename="dashboard-stats" variant="ghost" />}
          <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-md">
            <Database className="w-4 h-4 text-primary-600" />
            <span className="text-sm text-slate-600">
              Processing <span className="text-primary-600 font-semibold">70TB</span> of Records
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-success-50 border border-success-200 rounded-md">
            <div className="w-2 h-2 bg-success-500 rounded-full" />
            <span className="text-sm text-success-700 font-medium">System Online</span>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-danger-50 border border-danger-200 text-danger-800 px-4 py-3 rounded-md">
          <p className="font-medium">Error loading dashboard</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {isLoading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-md p-5 animate-pulse">
                <div className="w-10 h-10 bg-slate-100 rounded-md mb-4" />
                <div className="h-4 bg-slate-100 rounded w-1/2 mb-2" />
                <div className="h-8 bg-slate-100 rounded w-3/4" />
              </div>
            ))}
          </>
        ) : (
          <>
            <StatsCard
              title="Total Scanned"
              value={formatNumber(stats?.total_scanned || 0)}
              subtitle="Documents processed"
              icon={FileSearch}
              trend={{ value: 12.5, isPositive: true }}
              variant="primary"
            />
            <StatsCard
              title="Fraud Detected"
              value={stats?.fraud_detected || 0}
              subtitle="Suspicious documents"
              icon={AlertTriangle}
              trend={{ value: 8.2, isPositive: false }}
              variant="danger"
            />
            <StatsCard
              title="Total Savings"
              value={formatCurrency(stats?.total_savings || 0)}
              subtitle="Prevented losses"
              icon={IndianRupee}
              trend={{ value: 23.1, isPositive: true }}
              variant="success"
            />
            <StatsCard
              title="Pending Review"
              value={stats?.pending_review || 0}
              subtitle="Awaiting action"
              icon={Clock}
              variant="default"
            />
          </>
        )}
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-primary-50 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Detection Accuracy</p>
            <p className="text-2xl font-semibold text-slate-900">
              {stats?.accuracy_rate || 99.7}%
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-success-50 flex items-center justify-center">
            <Shield className="w-6 h-6 text-success-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Protected Transactions</p>
            <p className="text-2xl font-semibold text-slate-900">
              {formatNumber(stats?.total_scanned ? stats.total_scanned * 2.5 : 35500)}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-md bg-slate-100 flex items-center justify-center">
            <Database className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <p className="text-sm text-slate-500">Database Coverage</p>
            <p className="text-2xl font-semibold text-slate-900">70 TB</p>
          </div>
        </div>
      </div>

      {/* Chart and Live Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <div className="w-full h-[400px]">
            <DashboardChart />
          </div>
        </div>
        <div className="lg:col-span-1">
          <LiveFeed />
        </div>
      </div>

      {/* Recent Alerts Section */}
      <div className="bg-white border border-slate-200 rounded-md p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Critical Alerts</h3>
        <div className="space-y-3">
          {[
            {
              id: 1,
              title: 'Duplicate Invoice Detected',
              description: 'Invoice #INV-2024-5521 matches existing record from March 2024',
              department: 'Treasury Department',
              time: '5 min ago',
              amount: '₹45,00,000',
            },
            {
              id: 2,
              title: 'Forged Signature Alert',
              description: 'Pixel alteration detected in Contract #CON-2024-1102',
              department: 'Public Works',
              time: '23 min ago',
              amount: '₹12,50,000',
            },
            {
              id: 3,
              title: 'Vendor Blacklist Match',
              description: 'GST number linked to blacklisted entity in Bill #BIL-2024-8834',
              department: 'Health Services',
              time: '1 hour ago',
              amount: '₹8,75,000',
            },
          ].map((alert) => (
            <div
              key={alert.id}
              className="flex items-center gap-4 p-4 bg-danger-50 border border-danger-200 rounded-md hover:bg-danger-100 transition-colors cursor-pointer"
            >
              <div className="w-10 h-10 bg-danger-100 border border-danger-200 rounded-md flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-danger-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-slate-800">{alert.title}</p>
                  <span className="badge-critical">{alert.amount}</span>
                </div>
                <p className="text-sm text-slate-600 mt-0.5">{alert.description}</p>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                  <span>{alert.department}</span>
                  <span>•</span>
                  <span>{alert.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
