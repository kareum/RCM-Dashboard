import { useState } from 'react'
import { useBillingClinics }  from './useBillingClinics'
import { useInvoiceEntries }  from './useInvoiceEntries'
import { useBillingSettings } from './useBillingSettings'
import type { BillingClinic } from '../pages/billing/data'
import type { InvoiceEntryRecord, SaveCiPayload } from './useInvoiceEntries'

// ── Interface ────────────────────────────────────────────────

export interface BillingPageState {
  clinics:       BillingClinic[]
  activeId:      number
  activeClinic:  BillingClinic
  activeTab:     string
  selectClinic:  (id: number) => void   // also resets activeTab to 'invoice'
  setActiveTab:  (tab: string) => void
  records:       InvoiceEntryRecord[]
  loading:       boolean
  handleSaveInvoice: (
    year:  number,
    month: number,
    data: { rpmInvoice: number; ccmInvoice: number; rpmPts: number; ccmPts: number },
  ) => Promise<void>
  handleSaveCi: (year: number, month: number, ci: SaveCiPayload) => Promise<void>
}

// ── Hook ─────────────────────────────────────────────────────

export function useBillingPage(): BillingPageState {
  const { clinics } = useBillingClinics()
  const [activeId,  setActiveId]  = useState(clinics[0].id)
  const [activeTab, setActiveTab] = useState('invoice')

  const clinic       = clinics.find(c => c.id === activeId) ?? clinics[0]
  const dbSettings   = useBillingSettings(clinic.dbId)
  const activeClinic = dbSettings ? { ...clinic, ...dbSettings } : clinic

  const { records, loading, saveInvoice, saveCi } = useInvoiceEntries(clinic.dbId)

  async function handleSaveInvoice(
    year:  number,
    month: number,
    data: { rpmInvoice: number; ccmInvoice: number; rpmPts: number; ccmPts: number },
  ) {
    if (!clinic.dbId) return
    await saveInvoice({ clinicId: clinic.dbId, billingYear: year, billingMonth: month, ...data })
  }

  // Upsert: create invoice row first if it does not exist, then save CI
  async function handleSaveCi(year: number, month: number, ci: SaveCiPayload) {
    if (!clinic.dbId) return
    let entry = records.find(r => r.billingYear === year && r.billingMonth === month)
    if (!entry) {
      entry = await saveInvoice({
        clinicId: clinic.dbId, billingYear: year, billingMonth: month,
        rpmInvoice: 0, ccmInvoice: 0, rpmPts: 0, ccmPts: 0,
      })
    }
    await saveCi(entry.id, ci)
  }

  return {
    clinics,
    activeId,
    activeClinic,
    activeTab,
    selectClinic: (id) => { setActiveId(id); setActiveTab('invoice') },
    setActiveTab,
    records,
    loading,
    handleSaveInvoice,
    handleSaveCi,
  }
}
