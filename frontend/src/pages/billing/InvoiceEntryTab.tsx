import { useInvoiceForm }              from '../../hooks/useInvoiceForm'
import { useCIForm }                   from '../../hooks/useCIForm'
import { calcBilling }                 from '../../lib/billingCalcs'
import { Card, CardHeader, CardBody }  from '../../components/ui'
import { ServiceBlock, TotalCard, CISection } from '../../components/billing'
import { type BillingClinic, type InvoiceEntryRecord } from './data'
import type { SaveCiPayload } from '../../hooks/useInvoiceEntries'

// ── Props (interface only — no logic) ────────────────────────

export interface InvoiceEntryTabProps {
  clinic:        BillingClinic
  records:       InvoiceEntryRecord[]
  onSaveInvoice: (year: number, month: number, data: { rpmInvoice: number; ccmInvoice: number; rpmPts: number; ccmPts: number }) => Promise<void>
  onSaveCi:      (year: number, month: number, ci: SaveCiPayload) => Promise<void>
}

// ── View ──────────────────────────────────────────────────────

export function InvoiceEntryTab({ clinic, records, onSaveInvoice, onSaveCi }: InvoiceEntryTabProps) {
  const form  = useInvoiceForm(clinic, records, onSaveInvoice)
  const calcs = calcBilling(clinic, form.rpmInvoice, form.ccmInvoice)

  // CISection에 주입할 상태를 여기서 생성 — 컴포넌트는 인터페이스만 받음
  const ciForm = useCIForm(
    clinic,
    calcs.rpm,
    calcs.ccm,
    calcs.fee,
    form.currentEntry,
    ci => onSaveCi(form.year, form.month, ci),
  )

  return (
    <div className="flex flex-col gap-3.5 px-6 py-5">

      {/* Billing period navigator */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => form.setMonthOffset(v => v - 1)}
          className="w-7 h-7 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 flex items-center justify-center cursor-pointer bg-white"
        >‹</button>
        <span className="text-[14px] font-semibold text-slate-700 min-w-[120px] text-center">
          {form.monthLabel}
        </span>
        <button
          onClick={() => form.setMonthOffset(v => v + 1)}
          className="w-7 h-7 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 flex items-center justify-center cursor-pointer bg-white"
        >›</button>
        {form.monthOffset !== 0 && (
          <button
            onClick={() => form.setMonthOffset(0)}
            className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer bg-transparent border-none px-1"
            title="Go to current month"
          >Today</button>
        )}
        <span className={`text-[11px] px-2.5 py-1 rounded-full ${form.isPaid ? 'bg-[#EAF3DE] text-[#27500A]' : 'bg-[#FCEBEB] text-[#791F1F]'}`}>
          {form.isPaid ? 'Paid' : 'Unpaid'}
        </span>
        {form.autoSaveState === 'saving' && (
          <span className="ml-auto flex items-center gap-1 text-[11px] text-slate-400">
            <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
            Saving…
          </span>
        )}
        {form.autoSaveState === 'saved' && (
          <span className="ml-auto flex items-center gap-1 text-[11px] text-[#27500A]">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Saved
          </span>
        )}
      </div>

      {/* Invoice */}
      <Card>
        <CardHeader icon="receipt_long" title="Invoice" />
        <CardBody padding="sm">
          <ServiceBlock
            type="RPM"
            splitLabel={`Clinic ${clinic.rpmSplit[0]}% · Hicare ${clinic.rpmSplit[1]}%`}
            disabled={!clinic.services.includes('RPM')}
            invoice={form.rpmInvoice} pts={form.rpmPts}
            calcRows={calcs.rpmCalcRows}
            onInvoice={form.handleRpmInvoice} onPts={form.handleRpmPts}
          />
          <ServiceBlock
            type="CCM"
            splitLabel={`Clinic ${clinic.ccmSplit[0]}% · Hicare ${clinic.ccmSplit[1]}%`}
            disabled={!clinic.services.includes('CCM')}
            invoice={form.ccmInvoice} pts={form.ccmPts}
            calcRows={calcs.ccmCalcRows}
            onInvoice={form.handleCcmInvoice} onPts={form.handleCcmPts}
          />
          {calcs.invoiceTotalRows.length > 0 && <TotalCard rows={calcs.invoiceTotalRows} />}
          <div className="flex items-center gap-2 mt-3 px-3 py-2.5 bg-[#E6F1FB] rounded-md text-[11px] text-[#0C447C] leading-relaxed">
            <span className="material-symbols-outlined text-[14px] flex-shrink-0">info</span>
            <span>{calcs.infoText}</span>
          </div>
        </CardBody>
      </Card>

      {/* HicareNet Collection */}
      <Card>
        <CardHeader icon="account_balance" title="HicareNet Collection" />
        <CardBody padding="sm">
          {/* key resets ciForm 상태를 기간 변경 시 초기화 */}
          <CISection
            key={`${form.year}-${form.month}`}
            form={ciForm}
            clinic={clinic}
          />
        </CardBody>
      </Card>

      <div className="pb-6" />
    </div>
  )
}
