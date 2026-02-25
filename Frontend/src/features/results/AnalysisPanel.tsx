'use client'

import React from 'react'
import {
  AlertTriangle,
  FileWarning,
  Copy,
  Check,
  X,
  ExternalLink,
  Clock,
  Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { FraudGauge } from '@/components/ui/FraudGauge'
import type { ScanResult, Anomaly } from '@/lib/mock-api'

interface AnalysisPanelProps {
  result: ScanResult
  onApprove: () => void
  onReject: () => void
}

function AnomalyCard({ anomaly, index }: { anomaly: Anomaly; index: number }) {
  return (
    <div
      className="bg-red-50 border-l-4 border-red-600 p-4 text-red-900"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="font-semibold text-red-900">{anomaly.type}</h4>
            <span className="text-sm font-medium text-red-900">
              {Math.round(anomaly.confidence * 100)}% confidence
            </span>
          </div>
          <p className="text-sm text-red-900 mt-1">{anomaly.description}</p>
        </div>
      </div>
    </div>
  )
}

export function AnalysisPanel({ result, onApprove, onReject }: AnalysisPanelProps) {
  const [copied, setCopied] = React.useState(false)

  const copyFileId = () => {
    navigator.clipboard.writeText(result.file_id)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-2">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-gray-700 text-sm mb-2">
          <Clock className="w-4 h-4 text-gray-700" />
          <span>
            Scanned {new Date(result.scanned_at).toLocaleString('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </span>
        </div>
        <h2 className="text-2xl font-display font-bold text-gray-900">{result.filename}</h2>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-sm text-gray-700">ID: {result.file_id.slice(0, 8)}...</span>
          <button
            onClick={copyFileId}
            className="p-1 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Fraud Gauge */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 flex justify-center">
        <FraudGauge score={result.fraud_score} size="lg" />
      </div>

      {/* Severity Badge - CRITICAL: solid red banner; others: solid non-opacity */}
      <div
        className={cn(
          'p-4 rounded-xl text-center',
          result.severity === 'CRITICAL' && 'bg-red-600 text-white font-bold uppercase tracking-wide',
          result.severity === 'WARNING' && 'bg-amber-100 border border-amber-500 text-amber-900 font-bold',
          result.severity === 'SAFE' && 'bg-green-100 border border-green-500 text-green-900 font-bold'
        )}
      >
        <div className="flex items-center justify-center gap-2">
          <Shield
            className={cn(
              'w-5 h-5',
              result.severity === 'CRITICAL' && 'text-white',
              result.severity === 'WARNING' && 'text-amber-700',
              result.severity === 'SAFE' && 'text-green-700'
            )}
          />
          <span className={result.severity === 'CRITICAL' ? 'text-white' : ''}>
            {result.severity} RISK
          </span>
        </div>
      </div>

      {/* Duplicate Warning */}
      {result.is_duplicate && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 text-red-900">
          <div className="flex items-start gap-3">
            <FileWarning className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-900">⚠️ Duplicate Document Detected</h4>
              <p className="text-sm text-red-900 mt-1">
                This document appears to be a duplicate of an existing record in the database.
              </p>
              <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-700">Original Document Reference:</p>
                <div className="flex items-center gap-2 mt-1">
                  <code className="text-sm text-gray-900 font-mono">
                    {result.duplicate_source_id}
                  </code>
                  <button className="text-gray-700 hover:text-gray-900 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Anomalies List */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          Detected Anomalies ({result.anomalies.length})
        </h3>

        {result.anomalies.length > 0 ? (
          <div className="space-y-3">
            {result.anomalies.map((anomaly, index) => (
              <AnomalyCard key={index} anomaly={anomaly} index={index} />
            ))}
          </div>
        ) : (
          <div className="p-6 bg-green-50 border border-green-200 rounded-xl text-center">
            <Check className="w-10 h-10 text-green-600 mx-auto mb-2" />
            <p className="text-green-700 font-medium">No Anomalies Detected</p>
            <p className="text-sm text-gray-700 mt-1">
              This document passed all validation checks
            </p>
          </div>
        )}
      </div>

      {/* Processing Info */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3">Processing Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-700">Processing Time</span>
            <span className="text-gray-900">{(result.processing_time / 1000).toFixed(2)}s</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">Database Compared</span>
            <span className="text-gray-900">70 TB</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700">AI Model Version</span>
            <span className="text-gray-900">v2.4.1</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4 border-t border-gray-200">
        <button
          onClick={onApprove}
          className="flex-1 btn-primary flex items-center justify-center gap-2 py-4"
        >
          <Check className="w-5 h-5" />
          Approve Document
        </button>
        <button
          onClick={onReject}
          className="flex-1 btn-danger flex items-center justify-center gap-2 py-4"
        >
          <X className="w-5 h-5" />
          Reject & Flag
        </button>
      </div>
    </div>
  )
}

