import { useState, useCallback } from 'react'
import { Badge }             from '../components/ui'
import { NavTabs }           from '../components/ui/NavTabs'
import { ClinicListPanel }   from '../components/shared/ClinicListPanel'
import { InvoiceEntryTab }   from './billing/InvoiceEntryTab'
import { EntryHistoryTab }   from './billing/EntryHistoryTab'
import { useBillingClinics } from '../hooks/useBillingClinics'
import { BILLING_HISTORY }   from './billing/data'
import type { HistoryEntry } from './billing/data'

const TABS = [
  { key:'invoice', label:'Invoice entry' },
  { key:'history', label:'Entry history' },
]

export function BillingPage() {
  const { clinics } = useBillingClinics()
  const [activeId,  setActiveId]  = useState(clinics[0].id)
  const [activeTab, setActiveTab] = useState('invoice')

  /** 클리닉별 청구 내역 — mock 으로 초기화, 저장 시 업데이트 */
  const [entries, setEntries] = useState<Record<string, HistoryEntry[]>>(
    () => ({ ...BILLING_HISTORY }),
  )

  const clinic = clinics.find(c => c.id === activeId) ?? clinics[0]

  const handleSaveEntry = useCallback((clinicCode: string, entry: HistoryEntry) => {
    setEntries(prev => {
      const list = prev[clinicCode] ?? []
      const idx  = list.findIndex(e => e.period === entry.period)
      if (idx >= 0) {
        const updated = [...list]
        updated[idx] = { ...updated[idx], ...entry }
        return { ...prev, [clinicCode]: updated }
      }
      // 새 항목은 최신순 맨 앞
      return { ...prev, [clinicCode]: [entry, ...list] }
    })
  }, [])

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>

      {/* Left — 클리닉 목록 */}
      <ClinicListPanel
        activeId={activeId}
        onSelect={id => { setActiveId(id); setActiveTab('invoice') }}
      />

      {/* Right — main content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-page-bg">

        {/* Clinic header */}
        <div className="px-6 pt-5 pb-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[17px] font-medium text-slate-800">{clinic.name}</h2>
            {clinic.services.map(s => (
              <Badge key={s} variant={s === 'RPM' ? 'rpm' : 'ccm'}>{s}</Badge>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <NavTabs
          tabs={TABS}
          active={activeTab}
          onChange={setActiveTab}
          className="px-6 mt-4"
        />

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'invoice' && (
            <InvoiceEntryTab
              clinic={clinic}
              entries={entries[clinic.code] ?? []}
              onSaveEntry={entry => handleSaveEntry(clinic.code, entry)}
            />
          )}
          {activeTab === 'history' && (
            <EntryHistoryTab
              clinic={clinic}
              entries={entries[clinic.code] ?? []}
            />
          )}
        </div>
      </div>
    </div>
  )
}
