import { useState, useEffect, useCallback } from 'react'
import { useClinics }        from './useClinics'
import { useClinicSettings } from './useClinicSettings'
import type { Clinic, ServiceType }  from '../data/clinics'
import type { EmrLink, ClinicDetail, SplitRecord, FeeRecord } from './useClinicSettings'

// ── Interfaces ───────────────────────────────────────────────

export interface ToastState {
  visible: boolean
  message: string
  variant: 'success' | 'error'
}

export interface HistoryModalState {
  open: boolean
  type: ServiceType | 'fee'
}

export interface ClinicSettingsPageState {
  // Clinic list + selection
  clinics:      Clinic[]
  activeId:     number
  clinic:       Clinic
  selectClinic: (id: number) => void

  // Clinic detail from DB
  detail:  ClinicDetail | null
  loading: boolean

  // Sync
  isSyncing:       boolean
  lastSyncedLabel: string
  handleSync:      () => Promise<void>

  // EMR links
  emrLinks:      (EmrLink & { _key: number })[]
  newEmr:        { name: string; url: string }
  updateNewEmr:  (field: 'name' | 'url', value: string) => void
  addEmr:        () => void
  removeEmr:     (key: number) => void
  updateEmrUrl:  (key: number, url: string) => void
  resetEmrLinks: () => void
  saveEmr:       () => Promise<void>

  // History modal
  historyModal:      HistoryModalState
  openSplitHistory:  (type: ServiceType) => void
  openFeeHistory:    () => void
  closeHistoryModal: () => void

  // Toast
  toast:      ToastState
  closeToast: () => void

  // Computed display values
  services:          ServiceType[]
  splitByType:       (svc: ServiceType) => SplitRecord | null
  currentFee:        FeeRecord | null
  splitHistoryRows:  SplitRecord[]
  feeHistoryRows:    FeeRecord[]
}

// ── Hook ─────────────────────────────────────────────────────

export function useClinicSettingsPage(): ClinicSettingsPageState {
  const [activeId,      setActiveId]      = useState(1)
  const [isSyncing,     setIsSyncing]     = useState(false)
  const [emrLinks,      setEmrLinks]      = useState<(EmrLink & { _key: number })[]>([])
  const [newEmr,        setNewEmr]        = useState({ name: '', url: '' })
  const [historyModal,  setHistoryModal]  = useState<HistoryModalState>({ open: false, type: 'RPM' })
  const [toast,         setToast]         = useState<ToastState>({ visible: false, message: '', variant: 'success' })

  const { clinics }                                    = useClinics()
  const clinic                                         = clinics.find(c => c.id === activeId) ?? clinics[0]
  const { detail, loading, saveEmrLinks, triggerSync } = useClinicSettings(clinic.dbId)

  const showToast = useCallback((message: string, variant: 'success' | 'error' = 'success') => {
    setToast({ visible: true, message, variant })
  }, [])

  // Re-initialize EMR links when the clinic changes
  useEffect(() => {
    if (!detail) return
    setEmrLinks((detail.emrLinks ?? []).map((e, i) => ({ ...e, _key: i })))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.id])

  const lastSyncedLabel = detail?.lastSyncedAt
    ? new Date(detail.lastSyncedAt).toLocaleString('en-US', {
        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
      })
    : 'Not synced'

  const handleSync = useCallback(async () => {
    setIsSyncing(true)
    try {
      await triggerSync()
      showToast('Sync complete — data updated')
    } catch {
      showToast('Sync failed', 'error')
    } finally {
      setIsSyncing(false)
    }
  }, [triggerSync, showToast])

  // EMR operations
  function addEmr() {
    if (!newEmr.name || !newEmr.url) { showToast('EMR name and URL are required', 'error'); return }
    setEmrLinks(prev => [...prev, { ...newEmr, _key: Date.now() }])
    setNewEmr({ name: '', url: '' })
  }

  function removeEmr(key: number) {
    setEmrLinks(prev => prev.filter(e => e._key !== key))
  }

  function updateEmrUrl(key: number, url: string) {
    setEmrLinks(prev => prev.map(l => l._key === key ? { ...l, url } : l))
  }

  function resetEmrLinks() {
    setEmrLinks((detail?.emrLinks ?? []).map((e, i) => ({ ...e, _key: i })))
  }

  async function saveEmr() {
    try {
      await saveEmrLinks(emrLinks.map(({ name, url }) => ({ name, url })))
      showToast('EMR links saved')
    } catch {
      showToast('Failed to save EMR links', 'error')
    }
  }

  // Computed display values
  const services = (detail?.serviceTypes ?? clinic.services) as ServiceType[]

  const splitByType = (svc: ServiceType): SplitRecord | null =>
    detail?.revenueSplitHistory.find(s => s.serviceType === svc) ?? null

  const currentFee = detail?.billerFeeHistory[0] ?? null

  const splitHistoryRows = historyModal.type !== 'fee'
    ? (detail?.revenueSplitHistory.filter(s => s.serviceType === historyModal.type) ?? [])
    : []

  const feeHistoryRows = historyModal.type === 'fee'
    ? (detail?.billerFeeHistory ?? [])
    : []

  return {
    clinics, activeId, clinic,
    selectClinic: setActiveId,
    detail, loading,
    isSyncing, lastSyncedLabel, handleSync,
    emrLinks,
    newEmr,
    updateNewEmr: (field, value) => setNewEmr(p => ({ ...p, [field]: value })),
    addEmr, removeEmr, updateEmrUrl, resetEmrLinks, saveEmr,
    historyModal,
    openSplitHistory:  (type) => setHistoryModal({ open: true, type }),
    openFeeHistory:    ()     => setHistoryModal({ open: true, type: 'fee' }),
    closeHistoryModal: ()     => setHistoryModal(p => ({ ...p, open: false })),
    toast,
    closeToast: () => setToast(p => ({ ...p, visible: false })),
    services, splitByType, currentFee, splitHistoryRows, feeHistoryRows,
  }
}
