'use client'

import React, { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { getChartData, type ChartDataPoint } from '@/lib/mock-api'

export function DashboardChart() {
  const [data, setData] = useState<ChartDataPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const chartData = await getChartData()
      setData(chartData)
      setIsLoading(false)
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-md p-6 h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Loading chart data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-md p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">Document Analysis Overview</h3>
          <p className="text-sm text-slate-500 mt-1">Uploads vs Fraud Detection - Last 7 Days</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-primary-500" />
            <span className="text-sm text-slate-600">Uploads</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-danger-500" />
            <span className="text-sm text-slate-600">Fraud Detected</span>
          </div>
        </div>
      </div>

      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barGap={8}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748b', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
              }}
              labelStyle={{ color: '#1e293b', fontWeight: 600 }}
              itemStyle={{ color: '#64748b' }}
            />
            <Bar
              yAxisId="left"
              dataKey="uploads"
              fill="#003366"
              radius={[2, 2, 0, 0]}
              name="Uploads"
            />
            <Bar
              yAxisId="right"
              dataKey="fraud"
              fill="#dc2626"
              radius={[2, 2, 0, 0]}
              name="Fraud Detected"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
