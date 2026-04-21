import { useState, useEffect } from 'react'
import type { BillingClinic, InvoiceEntryRecord } from '../pages/billing/data'
import type { SaveCiPayload } from './useInvoiceEntries'

// ── Interface ────────────────────────────────────────────────

export interface CIFormState {
  // Collapse/expand
  open:       boolean
  toggleOpen: () => void

  // Input mode
  mode:    'total' | 'split'
  setMode: (m: 'total' | 'split') => void

  // Total-mode fields
  totalAmt:       string
  setTotalAmt:    (v: string) => void
  totalDate:      string
  setTotalDate:   (v: string) => void
  totalMethod:    string
  setTotalMethod: (v: string) => void
  totalRef:       string
  setTotalRef:    (v: string) => void
  totalRemark:    string
  setTotalRemark: (v: string) => void

  // Split-mode fields
  rpmAmt:         string
  setRpmAmt:      (v: string) => void
  ccmAmt:         string
  setCcmAmt:      (v: string) => void
  splitRemark:    string
  setSplitRemark: (v: string) => void

  // Derived amounts
  rpmExpected:      number
  ccmExpected:      number
  totalExpected:    number
  ciTotal:          number
  uncollected:      number
  rpmReceived:      number
  ccmReceived:      number
  totalReceived:    number
  splitUncollected: number

  // Persisted value from DB
  savedCiAmount: number | null

  // Save action
  saving:       boolean
  ciSaved:      boolean
  handleSaveCi: () => Promise<void>
}

// ── Hook ─────────────────────────────────────────────────────

export function useCIForm(
  clinic:     BillingClinic,
  rpmInv:     number,
  ccmInv:     number,
  fee:        number,
  existingCi: InvoiceEntryRecord | null,
  onSaveCi:   (payload: SaveCiPayload) => Promise<void>,
): CIFormState {
  const [open,        setOpen]        = useState(false)
  const [mode,        setMode]        = useState<'total' | 'split'>('total')
  const [totalAmt,    setTotalAmt]    = useState('')
  const [totalDate,   setTotalDate]   = useState('')
  const [totalMethod, setTotalMethod] = useState('')
  const [totalRef,    setTotalRef]    = useState('')
  const [totalRemark, setTotalRemark] = useState('')
  const [rpmAmt,      setRpmAmt]      = useState('')
  const [ccmAmt,      setCcmAmt]      = useState('')
  const [splitRemark, setSplitRemark] = useState('')
  const [ciSaved,     setCiSaved]     = useState(false)
  const [saving,      setSaving]      = useState(false)

  // Re-initialize from DB when the record changes
  useEffect(() => {
    setTotalAmt(existingCi?.ciAmount != null ? String(existingCi.ciAmount) : '')
    setTotalDate(existingCi?.ciDate ?? '')
    setTotalMethod(existingCi?.ciMethod ?? '')
    setTotalRef(existingCi?.ciReference ?? '')
    setTotalRemark(existingCi?.ciRemark ?? '')
    setRpmAmt('')
    setCcmAmt('')
    setSplitRemark('')
  // Only re-run on record-id change, not on every individual field
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingCi?.id])

  const rpmExpected   = rpmInv * (clinic.rpmSplit[1] / 100)
  const ccmExpected   = ccmInv * (clinic.ccmSplit[1] / 100)
  const totalExpected = rpmExpected + ccmExpected - fee

  const ciTotal     = parseFloat(totalAmt) || 0
  const uncollected = totalExpected - ciTotal

  const rpmReceived      = parseFloat(rpmAmt) || 0
  const ccmReceived      = parseFloat(ccmAmt) || 0
  const totalReceived    = rpmReceived + ccmReceived
  const splitUncollected = totalExpected - totalReceived

  const savedCiAmount = existingCi?.ciAmount ?? null

  async function handleSaveCi() {
    setSaving(true)
    try {
      if (mode === 'total') {
        const amount = ciTotal > 0 ? ciTotal : null
        await onSaveCi({
          ciAmount:    amount,
          ciDate:      totalDate || null,
          ciMethod:    (totalMethod as 'ACH' | 'Zelle' | 'Check') || null,
          ciReference: totalRef || null,
          ciRemark:    totalRemark || null,
          status:      amount != null && amount > 0 ? 'paid' : 'unpaid',
        })
      } else {
        const amount = totalReceived > 0 ? totalReceived : null
        await onSaveCi({
          ciAmount:    amount,
          ciDate:      null,
          ciMethod:    null,
          ciReference: null,
          ciRemark:    splitRemark || null,
          status:      amount != null && amount > 0 ? 'paid' : 'unpaid',
        })
      }
      setCiSaved(true)
      setTimeout(() => setCiSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return {
    open, toggleOpen: () => setOpen(v => !v),
    mode, setMode,
    totalAmt, setTotalAmt,
    totalDate, setTotalDate,
    totalMethod, setTotalMethod,
    totalRef, setTotalRef,
    totalRemark, setTotalRemark,
    rpmAmt, setRpmAmt,
    ccmAmt, setCcmAmt,
    splitRemark, setSplitRemark,
    rpmExpected, ccmExpected, totalExpected,
    ciTotal, uncollected,
    rpmReceived, ccmReceived, totalReceived, splitUncollected,
    savedCiAmount,
    saving, ciSaved, handleSaveCi,
  }
}
