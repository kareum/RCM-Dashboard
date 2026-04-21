import { Badge }            from '../components/ui'
import { NavTabs }          from '../components/ui/NavTabs'
import { ClinicListPanel }  from '../components/shared/ClinicListPanel'
import { InvoiceEntryTab }  from './billing/InvoiceEntryTab'
import { EntryHistoryTab }  from './billing/EntryHistoryTab'
import { useBillingPage }   from '../hooks/useBillingPage'

const TABS = [
  { key: 'invoice', label: 'Invoice entry' },
  { key: 'history', label: 'Entry history' },
]

export function BillingPage() {
  const page = useBillingPage()

  return (
    <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 65px)' }}>

      <ClinicListPanel
        activeId={page.activeId}
        onSelect={page.selectClinic}
      />

      <div className="flex-1 flex flex-col overflow-hidden bg-page-bg">

        <div className="px-6 pt-5 pb-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-[17px] font-medium text-slate-800">{page.activeClinic.name}</h2>
            {page.activeClinic.services.map(s => (
              <Badge key={s} variant={s === 'RPM' ? 'rpm' : 'ccm'}>{s}</Badge>
            ))}
          </div>
        </div>

        <NavTabs
          tabs={TABS}
          active={page.activeTab}
          onChange={page.setActiveTab}
          className="px-6 mt-4"
        />

        <div className="flex-1 overflow-y-auto">
          {page.activeTab === 'invoice' && (
            <InvoiceEntryTab
              clinic={page.activeClinic}
              records={page.records}
              onSaveInvoice={page.handleSaveInvoice}
              onSaveCi={page.handleSaveCi}
            />
          )}
          {page.activeTab === 'history' && (
            <EntryHistoryTab
              clinic={page.activeClinic}
              records={page.records}
              loading={page.loading}
            />
          )}
        </div>
      </div>
    </div>
  )
}
