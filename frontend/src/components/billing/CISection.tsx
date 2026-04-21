import { useCIForm }    from '../../hooks/useCIForm'
import type { CIFormState } from '../../hooks/useCIForm'
import { Button }       from '../ui'
import { MoneyInput }   from './MoneyInput'
import { SelectInput }  from './SelectInput'
import { CalcBox }      from './CalcBox'
import { TotalCard }    from './TotalCard'
import { fmtMoney }     from '../../lib/billingCalcs'
import type { BillingClinic, InvoiceEntryRecord } from '../../pages/billing/data'
import type { SaveCiPayload }                      from '../../hooks/useInvoiceEntries'

// ── Props ─────────────────────────────────────────────────────

export interface CISectionProps {
  clinic:     BillingClinic
  rpmInv:     number
  ccmInv:     number
  fee:        number
  existingCi: InvoiceEntryRecord | null
  onSaveCi:   (payload: SaveCiPayload) => Promise<void>
}

// ── View ──────────────────────────────────────────────────────

export function CISection(props: CISectionProps) {
  const f: CIFormState = useCIForm(
    props.clinic,
    props.rpmInv,
    props.ccmInv,
    props.fee,
    props.existingCi,
    props.onSaveCi,
  )

  return (
    <div className="border border-slate-200 rounded-md">

      {/* Header / toggle */}
      <button
        onClick={f.toggleOpen}
        className="w-full flex items-center justify-between px-3.5 py-3 cursor-pointer bg-transparent text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-slate-500">Enter deposit received by HicareNet</span>
          {f.savedCiAmount != null && !f.open && (
            <span className="text-[11px] text-[#27500A] bg-[#EAF3DE] px-2 py-0.5 rounded-full">
              Saved {fmtMoney(f.savedCiAmount)}
            </span>
          )}
        </div>
        <span className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform ${f.open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {f.open && (
        <div className="px-3.5 pb-4 pt-1 border-t border-slate-100 flex flex-col gap-4">

          {/* Mode toggle */}
          <div>
            <p className="text-[11px] text-slate-400 mb-2">Input method</p>
            <div className="flex border border-slate-200 rounded-md overflow-hidden w-fit">
              {(['total', 'split'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => f.setMode(m)}
                  className={[
                    'text-[12px] px-3.5 py-1.5 cursor-pointer border-none',
                    m !== 'total' ? 'border-l border-slate-200' : '',
                    f.mode === m ? 'bg-[#E6F1FB] text-[#0C447C] font-medium' : 'bg-slate-50 text-slate-500',
                  ].join(' ')}
                >
                  {m === 'total' ? 'Total amount' : 'RPM / CCM separately'}
                </button>
              ))}
            </div>
          </div>

          {/* Total mode */}
          {f.mode === 'total' && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-3">
                <MoneyInput
                  label="Deposit amount" id="ci-total-amt"
                  value={f.totalAmt} onChange={f.setTotalAmt}
                  hint={`Expected: ${fmtMoney(f.totalExpected)}`}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-500">Deposit date</label>
                  <input
                    type="date"
                    value={f.totalDate}
                    onChange={e => f.setTotalDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5]"
                  />
                </div>
                <SelectInput label="Payment method" id="ci-method" value={f.totalMethod} onChange={f.setTotalMethod} options={['ACH','Zelle','Check']} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-500">Reference no.</label>
                  <input
                    type="text" value={f.totalRef} onChange={e => f.setTotalRef(e.target.value)} placeholder="Check # / ACH ref"
                    className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5]"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-500">Remark</label>
                  <input
                    type="text" value={f.totalRemark} onChange={e => f.setTotalRemark(e.target.value)} placeholder="Optional note"
                    className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5]"
                  />
                </div>
              </div>
              {f.ciTotal > 0 && (
                <TotalCard rows={[
                  { label: 'Expected (HicareNet)', value: fmtMoney(f.totalExpected), color: 'text-[#0C447C]' },
                  { label: 'Received',             value: fmtMoney(f.ciTotal),       color: 'text-[#27500A]' },
                  { label: 'Uncollected',          value: fmtMoney(f.uncollected),   color: f.uncollected > 0 ? 'text-[#791F1F]' : 'text-[#27500A]', bold: true },
                ]} />
              )}
            </div>
          )}

          {/* Split mode */}
          {f.mode === 'split' && (
            <div className="flex flex-col gap-3">
              {props.clinic.services.includes('RPM') && (
                <div className="border border-slate-100 rounded-md overflow-hidden">
                  <div className="flex items-center px-3.5 py-2 bg-slate-50 border-b border-slate-100" style={{ borderLeft: '3px solid #185FA5' }}>
                    <span className="text-[12px] font-medium text-[#0C447C]">RPM — HicareNet deposit</span>
                  </div>
                  <div className="px-3.5 py-3 flex flex-col gap-2">
                    <MoneyInput label="RPM deposit amount" id="rpm-ci-amt" value={f.rpmAmt} onChange={f.setRpmAmt} hint={`Expected: ${fmtMoney(f.rpmExpected)}`} />
                    {f.rpmReceived > 0 && (
                      <CalcBox rows={[
                        { label: 'Expected',    value: fmtMoney(f.rpmExpected),                color: 'text-[#0C447C]' },
                        { label: 'Received',    value: fmtMoney(f.rpmReceived),                color: 'text-[#27500A]' },
                        { label: 'Uncollected', value: fmtMoney(f.rpmExpected - f.rpmReceived), color: f.rpmExpected - f.rpmReceived > 0 ? 'text-[#791F1F]' : 'text-[#27500A]', separator: true },
                      ]} />
                    )}
                  </div>
                </div>
              )}
              {props.clinic.services.includes('CCM') && (
                <div className="border border-slate-100 rounded-md overflow-hidden">
                  <div className="flex items-center px-3.5 py-2 bg-slate-50 border-b border-slate-100" style={{ borderLeft: '3px solid #1D9E75' }}>
                    <span className="text-[12px] font-medium text-[#085041]">CCM — HicareNet deposit</span>
                  </div>
                  <div className="px-3.5 py-3 flex flex-col gap-2">
                    <MoneyInput label="CCM deposit amount" id="ccm-ci-amt" value={f.ccmAmt} onChange={f.setCcmAmt} hint={`Expected: ${fmtMoney(f.ccmExpected)}`} />
                    {f.ccmReceived > 0 && (
                      <CalcBox rows={[
                        { label: 'Expected',    value: fmtMoney(f.ccmExpected),                color: 'text-[#0C447C]' },
                        { label: 'Received',    value: fmtMoney(f.ccmReceived),                color: 'text-[#27500A]' },
                        { label: 'Uncollected', value: fmtMoney(f.ccmExpected - f.ccmReceived), color: f.ccmExpected - f.ccmReceived > 0 ? 'text-[#791F1F]' : 'text-[#27500A]', separator: true },
                      ]} />
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-500">Remark</label>
                <input
                  type="text" value={f.splitRemark} onChange={e => f.setSplitRemark(e.target.value)} placeholder="Optional note"
                  className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5]"
                />
              </div>
              {f.totalReceived > 0 && (
                <TotalCard rows={[
                  { label: 'Total expected (HicareNet)', value: fmtMoney(f.totalExpected),    color: 'text-[#0C447C]' },
                  { label: 'Total received',             value: fmtMoney(f.totalReceived),    color: 'text-[#27500A]' },
                  { label: 'Total uncollected',          value: fmtMoney(f.splitUncollected), color: f.splitUncollected > 0 ? 'text-[#791F1F]' : 'text-[#27500A]', bold: true },
                ]} />
              )}
            </div>
          )}

          {/* Save button */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            {f.ciSaved && (
              <span className="flex items-center gap-1 text-[12px] text-[#27500A]">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Saved
              </span>
            )}
            <Button variant="secondary" size="sm" onClick={f.handleSaveCi} disabled={f.saving}>
              {f.saving ? 'Saving…' : 'Save CI'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
