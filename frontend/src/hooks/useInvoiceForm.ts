import { useState, useEffect, useRef } from 'react'
import type { BillingClinic, InvoiceEntryRecord } from '../pages/billing/data'
import { offsetMonth } from '../lib/billingCalcs'

// ── Interface ────────────────────────────────────────────────

export interface InvoiceFormState {
  // Period navigation
  year:           number
  month:          number
  monthLabel:     string
  monthOffset:    number
  setMonthOffset: (fn: number | ((prev: number) => number)) => void

  // Form field values
  rpmInvoice: string
  ccmInvoice: string
  rpmPts:     string
  ccmPts:     string

  // Input handlers — set value and mark form dirty for autosave
  handleRpmInvoice: (v: string) => void
  handleCcmInvoice: (v: string) => void
  handleRpmPts:     (v: string) => void
  handleCcmPts:     (v: string) => void

  // Save status
  autoSaveState: 'idle' | 'saving' | 'saved'

  // DB record for current period
  currentEntry: InvoiceEntryRecord | null
  isPaid:       boolean
}

// ── Hook ─────────────────────────────────────────────────────

type SaveInvoiceFn = (
  year:  number,
  month: number,
  data: { rpmInvoice: number; ccmInvoice: number; rpmPts: number; ccmPts: number },
) => Promise<void>

export function useInvoiceForm(
  _clinic:       BillingClinic,
  records:       InvoiceEntryRecord[],
  onSaveInvoice: SaveInvoiceFn,
): InvoiceFormState {
  const [monthOffset,   setMonthOffset]   = useState(0)
  const [rpmInvoice,    setRpmInvoice]    = useState('')
  const [ccmInvoice,    setCcmInvoice]    = useState('')
  const [rpmPts,        setRpmPts]        = useState('')
  const [ccmPts,        setCcmPts]        = useState('')
  const [isDirty,       setIsDirty]       = useState(false)
  const [autoSaveState, setAutoSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Keep a stable ref to avoid stale closures in the debounce timer
  const onSaveRef = useRef(onSaveInvoice)
  useEffect(() => { onSaveRef.current = onSaveInvoice })

  const yearRef  = useRef(0)
  const monthRef = useRef(0)

  const { year, month, label: monthLabel } = offsetMonth(monthOffset)

  useEffect(() => {
    yearRef.current  = year
    monthRef.current = month
  }, [year, month])

  const currentEntry = records.find(r => r.billingYear === year && r.billingMonth === month) ?? null
  const isPaid       = currentEntry?.status === 'paid'

  // Re-initialize form when period or saved record changes
  useEffect(() => {
    setRpmInvoice(currentEntry?.rpmInvoice != null ? String(currentEntry.rpmInvoice) : '')
    setCcmInvoice(currentEntry?.ccmInvoice != null ? String(currentEntry.ccmInvoice) : '')
    setRpmPts(currentEntry?.rpmPts != null ? String(currentEntry.rpmPts) : '')
    setCcmPts(currentEntry?.ccmPts != null ? String(currentEntry.ccmPts) : '')
    setIsDirty(false)
    setAutoSaveState('idle')
  // Only re-run on period/record-id change, not on every field update
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, currentEntry?.id])

  // 800 ms debounced autosave when dirty
  useEffect(() => {
    if (!isDirty) return
    const rpm = parseFloat(rpmInvoice) || 0
    const ccm = parseFloat(ccmInvoice) || 0
    if (!rpm && !ccm) return

    setAutoSaveState('saving')
    const timer = setTimeout(async () => {
      try {
        await onSaveRef.current(yearRef.current, monthRef.current, {
          rpmInvoice: rpm,
          ccmInvoice: ccm,
          rpmPts:     parseFloat(rpmPts) || 0,
          ccmPts:     parseFloat(ccmPts) || 0,
        })
        setIsDirty(false)
        setAutoSaveState('saved')
        setTimeout(() => setAutoSaveState('idle'), 2000)
      } catch {
        setAutoSaveState('idle')
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [rpmInvoice, ccmInvoice, rpmPts, ccmPts, isDirty])

  return {
    year, month, monthLabel, monthOffset, setMonthOffset,
    rpmInvoice, ccmInvoice, rpmPts, ccmPts,
    handleRpmInvoice: (v) => { setRpmInvoice(v); setIsDirty(true) },
    handleCcmInvoice: (v) => { setCcmInvoice(v); setIsDirty(true) },
    handleRpmPts:     (v) => { setRpmPts(v);     setIsDirty(true) },
    handleCcmPts:     (v) => { setCcmPts(v);     setIsDirty(true) },
    autoSaveState,
    currentEntry,
    isPaid,
  }
}
