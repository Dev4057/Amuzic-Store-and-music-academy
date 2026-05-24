'use client'

import { useState } from 'react'

interface ConfirmDialogProps {
  title: string
  description: string
  confirmLabel?: string
  variant?: 'danger' | 'default'
  onConfirm: () => Promise<void>
  trigger: React.ReactNode
}

export function ConfirmDialog({
  title,
  description,
  confirmLabel = 'Confirm',
  variant = 'default',
  onConfirm,
  trigger,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
      setOpen(false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <span onClick={() => setOpen(true)} style={{ display: 'contents', cursor: 'pointer' }}>
        {trigger}
      </span>

      {open && (
        <div className="dialog-overlay" onClick={() => { if (!loading) setOpen(false) }}>
          <div className="dialog-box" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">{title}</div>
            <div className="dialog-body">{description}</div>
            <div className="dialog-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                className={`btn ${variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                onClick={() => { void handleConfirm() }}
                disabled={loading}
              >
                {loading ? <><span className="spinner" style={{ width: 14, height: 14 }} /> Working…</> : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
