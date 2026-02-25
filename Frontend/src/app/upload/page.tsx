'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Shield, Clock, CheckCircle2, AlertTriangle, FileText, HelpCircle } from 'lucide-react'
import { DropZone } from '@/features/upload/DropZone'
import { ScanningModal } from '@/features/upload/ScanningModal'
import { uploadDocument } from '@/lib/api'
import { uploadFile } from '@/lib/api-client'
import { useToast } from '@/components/providers/ToastProvider'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ProgressBar } from '@/components/ui/ProgressBar'

export default function UploadPage() {
  const router = useRouter()
  const { addToast } = useToast()
  const [isScanning, setIsScanning] = useState(false)
  const [currentFile, setCurrentFile] = useState<File | null>(null)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileSelect = async (file: File) => {
    setCurrentFile(file)
    setIsUploading(true)
    setUploadProgress(0)
    setIsScanning(false)

    try {
      let finalProgress = 0
      const response = await uploadFile(
        `/scan/upload`,
        file,
        (progress) => {
          finalProgress = progress
          setUploadProgress(progress)
        }
      )

      if (finalProgress < 100) {
        setUploadProgress(100)
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      const uploadRes = await response.json()
      setScanResult(uploadRes.task_id)

      setIsUploading(false)
      setIsScanning(true)
    } catch (error) {
      addToast({
        type: 'error',
        title: 'Upload Failed',
        message: 'An error occurred while uploading the document. Please try again.',
      })
      setCurrentFile(null)
      setUploadProgress(0)
      setIsUploading(false)
      setIsScanning(false)
    }
  }

  const handleScanComplete = () => {
    setIsScanning(false)
    if (scanResult) {
      setTimeout(() => {
        router.push(`/analysis-results?taskId=${scanResult}`)
      }, 500)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Breadcrumbs */}
      <Breadcrumbs items={[{ label: 'Dashboard', href: '/' }, { label: 'Upload Documents' }]} />

      {/* Upload Progress */}
      {(isUploading || (uploadProgress === 100 && !isScanning)) && (
        <div className="bg-white border border-success-200 rounded-md p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600 flex items-center gap-2">
              {uploadProgress < 100 ? (
                <>
                  <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
                  Uploading file...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-success-600" />
                  <span className="text-success-700">Upload complete!</span>
                </>
              )}
            </span>
            <span className="text-sm font-medium text-success-700">{Math.round(uploadProgress)}%</span>
          </div>
          <ProgressBar progress={uploadProgress} variant="success" size="md" />
          {uploadProgress === 100 && !isScanning && (
            <p className="text-xs text-success-600 mt-2 flex items-center gap-1">
              <span className="w-2 h-2 bg-success-500 rounded-full animate-pulse" />
              Preparing document for analysis...
            </p>
          )}
        </div>
      )}

      {/* Page Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-md bg-primary-50 mb-4">
          <Shield className="w-6 h-6 md:w-8 md:h-8 text-primary-600" />
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Document Upload</h1>
        <p className="text-sm md:text-base text-slate-500 mt-2 max-w-lg mx-auto px-4">
          Upload invoices, contracts, or any financial documents for AI-powered fraud detection
          and validation against our 70TB database.
        </p>
      </div>

      {/* Upload Zone */}
      <DropZone onFileSelect={handleFileSelect} disabled={isScanning || isUploading} />

      {/* Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        <div className="bg-white border border-slate-200 rounded-md p-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-md bg-primary-50 flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-primary-600" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">Fast Processing</h3>
          <p className="text-sm text-slate-500">
            Documents are analyzed in under 5 seconds using our AI engine
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-md bg-success-50 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-6 h-6 text-success-600" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">99.7% Accuracy</h3>
          <p className="text-sm text-slate-500">
            Our models are trained on millions of verified documents
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-md p-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-md bg-danger-50 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-danger-600" />
          </div>
          <h3 className="font-semibold text-slate-800 mb-2">Fraud Detection</h3>
          <p className="text-sm text-slate-500">
            Detects duplicates, forgeries, and metadata anomalies
          </p>
        </div>
      </div>

      {/* Recent Uploads */}
      <div className="bg-white border border-slate-200 rounded-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800">Recent Uploads</h3>
          <button className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
            View History
          </button>
        </div>

        <div className="space-y-3">
          {[
            { name: 'Invoice_Treasury_2024_5521.pdf', status: 'critical', time: '5 min ago', score: 92 },
            { name: 'Contract_PWD_Tender_1102.pdf', status: 'warning', time: '23 min ago', score: 58 },
            { name: 'Receipt_Health_Services_8834.pdf', status: 'safe', time: '1 hour ago', score: 12 },
            { name: 'Bill_Education_Board_2210.pdf', status: 'safe', time: '2 hours ago', score: 8 },
          ].map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              onClick={() => router.push(`/results/demo`)}
            >
              <div
                className={`w-10 h-10 rounded-md flex items-center justify-center ${file.status === 'safe'
                    ? 'bg-success-50 border border-success-200'
                    : file.status === 'warning'
                      ? 'bg-warning-50 border border-warning-200'
                      : 'bg-danger-50 border border-danger-200'
                  }`}
              >
                <FileText
                  className={`w-5 h-5 ${file.status === 'safe'
                      ? 'text-success-600'
                      : file.status === 'warning'
                        ? 'text-warning-600'
                        : 'text-danger-600'
                    }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-500">{file.time}</p>
              </div>
              <div className="text-right">
                <p
                  className={`text-lg font-bold ${file.status === 'safe'
                      ? 'text-success-600'
                      : file.status === 'warning'
                        ? 'text-warning-600'
                        : 'text-danger-600'
                    }`}
                >
                  {file.score}%
                </p>
                <p className="text-xs text-slate-500">Risk</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-primary-50 border border-primary-200 rounded-md p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-md bg-primary-100 flex items-center justify-center flex-shrink-0">
            <HelpCircle className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 mb-2">Need Help?</h3>
            <p className="text-sm text-slate-600 mb-3">
              Our system accepts various document formats including PDF, DOC, DOCX, XLS, XLSX, and image files.
              Each document is encrypted during transmission and processed in a secure environment.
            </p>
            <button className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors">
              Read Documentation →
            </button>
          </div>
        </div>
      </div>

      {/* Scanning Modal */}
      <ScanningModal
        isOpen={isScanning}
        filename={currentFile?.name || ''}
        onComplete={handleScanComplete}
      />
    </div>
  )
}
