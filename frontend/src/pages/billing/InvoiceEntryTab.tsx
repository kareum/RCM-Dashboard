import { useState } from 'react'
import { Button, Card, CardHeader, CardBody } from '../../components/ui'
import { type BillingClinic, type HistoryEntry, fmt } from './data'

// ── helpers ─────────────────────────────────────────────────

function MoneyInput({
  label, id, value, onChange, hint,
}: { label: string; id: string; value: string; onChange: (v: string) => void; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] text-slate-500">{label}</label>
      <div className="relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] pointer-events-none">$</span>
        <input
          id={id}
          type="number"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full pl-5 pr-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5] transition-colors"
        />
      </div>
      {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
    </div>
  )
}

function SelectInput({ label, id, value, onChange, options }: { label: string; id: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-[11px] text-slate-500">{label}</label>
      <select
        id={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5] transition-colors"
      >
        <option value="">Select</option>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  )
}

function CalcBox({ rows }: { rows: { label: string; value: string; color?: string; separator?: boolean }[] }) {
  return (
    <div className="bg-slate-50 rounded-md px-3 py-2.5 mt-2 flex flex-col gap-0.5">
      {rows.map((r, i) => (
        <div key={i} className={`flex items-center gap-3 py-0.5 text-[12px] ${r.separator ? 'border-t border-slate-200 mt-1.5 pt-2' : ''}`}>
          <span className="text-slate-500 shrink-0">{r.label}</span>
          <span className={`font-mono ${r.color ?? 'text-slate-800'}`}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}

function TotalCard({ rows }: { rows: { label: string; value: string; color?: string; bold?: boolean }[] }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-md px-3.5 py-3 flex flex-col gap-0.5 mt-3">
      {rows.map((r, i) => (
        <div key={i} className={`flex justify-between items-center py-0.5 text-[13px] ${r.bold ? 'font-medium border-t border-slate-200 mt-1.5 pt-2.5' : ''}`}>
          <span className="text-slate-500">{r.label}</span>
          <span className={`font-mono ${r.color ?? 'text-slate-800'}`}>{r.value}</span>
        </div>
      ))}
    </div>
  )
}

// ── ServiceBlock ─────────────────────────────────────────────

interface ServiceBlockProps {
  type:       'RPM' | 'CCM'
  splitLabel: string
  disabled:   boolean
  invoice:    string
  pts:        string
  calcRows:   { label: string; value: string; color?: string }[]
  onInvoice:  (v: string) => void
  onPts:      (v: string) => void
}

function ServiceBlock({ type, splitLabel, disabled, invoice, pts, calcRows, onInvoice, onPts }: ServiceBlockProps) {
  const isRpm    = type === 'RPM'
  const accent   = isRpm ? '#185FA5' : '#1D9E75'
  const labelCls = isRpm ? 'text-[#0C447C]' : 'text-[#085041]'

  return (
    <div className={`border border-slate-100 rounded-md overflow-hidden mb-3 last:mb-0 ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
      <div
        className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50 border-b border-slate-100"
        style={{ borderLeft: `3px solid ${accent}` }}
      >
        <div className="flex items-center gap-2">
          <span className={`text-[12px] font-medium ${labelCls}`}>{type}</span>
          <span className="text-slate-300 text-[11px]">·</span>
          <input
            type="number"
            value={pts}
            onChange={e => onPts(e.target.value)}
            placeholder="0"
            className="w-14 text-center px-1.5 py-0.5 text-[11px] border border-slate-200 rounded bg-white focus:outline-none focus:border-[#185FA5]"
          />
          <span className="text-[10px] text-slate-400">pts</span>
        </div>
        <span className="text-[11px] text-slate-400">{splitLabel}</span>
      </div>
      <div className="px-3.5 py-3 grid grid-cols-2 gap-4 items-center">
        <MoneyInput label={`${type} invoice total`} id={`${type}-invoice`} value={invoice} onChange={onInvoice} />
        {calcRows.length > 0 && <CalcBox rows={calcRows} />}
      </div>
    </div>
  )
}

// ── CISection ────────────────────────────────────────────────

interface CISectionProps {
  clinic:       BillingClinic
  rpmInv:       number
  ccmInv:       number
  fee:          number
  savedCiAmount: number | null
  onSaveCi:     (amount: number | null) => void
}

function CISection({ clinic, rpmInv, ccmInv, fee, savedCiAmount, onSaveCi }: CISectionProps) {
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

  const rpmExpected   = rpmInv * (clinic.rpmSplit[1] / 100)
  const ccmExpected   = ccmInv * (clinic.ccmSplit[1] / 100)
  const totalExpected = rpmExpected + ccmExpected - fee

  const ciTotal        = parseFloat(totalAmt) || 0
  const uncollected    = totalExpected - ciTotal

  const rpmReceived      = parseFloat(rpmAmt) || 0
  const ccmReceived      = parseFloat(ccmAmt) || 0
  const totalReceived    = rpmReceived + ccmReceived
  const splitUncollected = totalExpected - totalReceived

  function handleSaveCi() {
    const amount = mode === 'total'
      ? (ciTotal > 0 ? ciTotal : null)
      : (totalReceived > 0 ? totalReceived : null)
    onSaveCi(amount)
    setCiSaved(true)
    setTimeout(() => setCiSaved(false), 2000)
  }

  return (
    <div className="border border-slate-200 rounded-md">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3.5 py-3 cursor-pointer bg-transparent text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-slate-500">Enter deposit received by HicareNet</span>
          {savedCiAmount != null && !open && (
            <span className="text-[11px] text-[#27500A] bg-[#EAF3DE] px-2 py-0.5 rounded-full">
              Saved {fmt(savedCiAmount)}
            </span>
          )}
        </div>
        <span className={`material-symbols-outlined text-[18px] text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}>
          expand_more
        </span>
      </button>

      {open && (
        <div className="px-3.5 pb-4 pt-1 border-t border-slate-100 flex flex-col gap-4">

          {/* Mode toggle */}
          <div>
            <p className="text-[11px] text-slate-400 mb-2">Input method</p>
            <div className="flex border border-slate-200 rounded-md overflow-hidden w-fit">
              {(['total', 'split'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={[
                    'text-[12px] px-3.5 py-1.5 cursor-pointer border-none',
                    m !== 'total' ? 'border-l border-slate-200' : '',
                    mode === m ? 'bg-[#E6F1FB] text-[#0C447C] font-medium' : 'bg-slate-50 text-slate-500',
                  ].join(' ')}
                >
                  {m === 'total' ? 'Total amount' : 'RPM / CCM separately'}
                </button>
              ))}
            </div>
          </div>

          {/* Total mode */}
          {mode === 'total' && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-3">
                <MoneyInput
                  label="Deposit amount" id="ci-total-amt"
                  value={totalAmt} onChange={setTotalAmt}
                  hint={`Expected: ${fmt(totalExpected)}`}
                />
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-500">Deposit date</label>
                  <input type="date" value={totalDate} onChange={e => setTotalDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5]" />
                </div>
                <SelectInput label="Payment method" id="ci-method" value={totalMethod} onChange={setTotalMethod} options={['ACH','Zelle','Check']} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-500">Reference no.</label>
                  <input type="text" value={totalRef} onChange={e => setTotalRef(e.target.value)} placeholder="Check # / ACH ref"
                    className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5]" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] text-slate-500">Remark</label>
                  <input type="text" value={totalRemark} onChange={e => setTotalRemark(e.target.value)} placeholder="Optional note"
                    className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5]" />
                </div>
              </div>
              {ciTotal > 0 && (
                <TotalCard rows={[
                  { label:'Expected (HicareNet)', value: fmt(totalExpected), color:'text-[#0C447C]' },
                  { label:'Received',             value: fmt(ciTotal),       color:'text-[#27500A]' },
                  { label:'Uncollected',          value: fmt(uncollected),   color: uncollected > 0 ? 'text-[#791F1F]' : 'text-[#27500A]', bold: true },
                ]} />
              )}
            </div>
          )}

          {/* Split mode */}
          {mode === 'split' && (
            <div className="flex flex-col gap-3">
              {clinic.services.includes('RPM') && (
                <div className="border border-slate-100 rounded-md overflow-hidden">
                  <div className="flex items-center px-3.5 py-2 bg-slate-50 border-b border-slate-100" style={{ borderLeft:'3px solid #185FA5' }}>
                    <span className="text-[12px] font-medium text-[#0C447C]">RPM — HicareNet deposit</span>
                  </div>
                  <div className="px-3.5 py-3 flex flex-col gap-2">
                    <MoneyInput label="RPM deposit amount" id="rpm-ci-amt" value={rpmAmt} onChange={setRpmAmt} hint={`Expected: ${fmt(rpmExpected)}`} />
                    {rpmReceived > 0 && (
                      <CalcBox rows={[
                        { label:'Expected',      value: fmt(rpmExpected),                color:'text-[#0C447C]' },
                        { label:'Received',      value: fmt(rpmReceived),                color:'text-[#27500A]' },
                        { label:'Uncollected',   value: fmt(rpmExpected - rpmReceived),  color: rpmExpected - rpmReceived > 0 ? 'text-[#791F1F]' : 'text-[#27500A]', separator: true },
                      ]} />
                    )}
                  </div>
                </div>
              )}
              {clinic.services.includes('CCM') && (
                <div className="border border-slate-100 rounded-md overflow-hidden">
                  <div className="flex items-center px-3.5 py-2 bg-slate-50 border-b border-slate-100" style={{ borderLeft:'3px solid #1D9E75' }}>
                    <span className="text-[12px] font-medium text-[#085041]">CCM — HicareNet deposit</span>
                  </div>
                  <div className="px-3.5 py-3 flex flex-col gap-2">
                    <MoneyInput label="CCM deposit amount" id="ccm-ci-amt" value={ccmAmt} onChange={setCcmAmt} hint={`Expected: ${fmt(ccmExpected)}`} />
                    {ccmReceived > 0 && (
                      <CalcBox rows={[
                        { label:'Expected',    value: fmt(ccmExpected),                color:'text-[#0C447C]' },
                        { label:'Received',    value: fmt(ccmReceived),                color:'text-[#27500A]' },
                        { label:'Uncollected', value: fmt(ccmExpected - ccmReceived),  color: ccmExpected - ccmReceived > 0 ? 'text-[#791F1F]' : 'text-[#27500A]', separator: true },
                      ]} />
                    )}
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-slate-500">Remark</label>
                <input type="text" value={splitRemark} onChange={e => setSplitRemark(e.target.value)} placeholder="Optional note"
                  className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-md bg-white focus:outline-none focus:border-[#185FA5]" />
              </div>
              {totalReceived > 0 && (
                <TotalCard rows={[
                  { label:'Total expected (HicareNet)', value: fmt(totalExpected),    color:'text-[#0C447C]' },
                  { label:'Total received',             value: fmt(totalReceived),    color:'text-[#27500A]' },
                  { label:'Total uncollected',          value: fmt(splitUncollected), color: splitUncollected > 0 ? 'text-[#791F1F]' : 'text-[#27500A]', bold: true },
                ]} />
              )}
            </div>
          )}

          {/* CI Save button */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            {ciSaved && (
              <span className="flex items-center gap-1 text-[12px] text-[#27500A]">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Saved
              </span>
            )}
            <Button variant="secondary" size="sm" onClick={handleSaveCi}>
              Save CI
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── InvoiceEntryTab ──────────────────────────────────────────

interface InvoiceEntryTabProps {
  clinic:       BillingClinic
  entries:      HistoryEntry[]
  onSaveEntry:  (entry: HistoryEntry) => void
}

const MONTHS      = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December']
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun',
                      'Jul','Aug','Sep','Oct','Nov','Dec']

export function InvoiceEntryTab({ clinic, entries, onSaveEntry }: InvoiceEntryTabProps) {
  const [monthOffset, setMonthOffset] = useState(2)
  const [rpmInvoice,  setRpmInvoice]  = useState('18450')
  const [ccmInvoice,  setCcmInvoice]  = useState('19097')
  const [rpmPts,      setRpmPts]      = useState('126')
  const [ccmPts,      setCcmPts]      = useState('165')
  const [invoiceSaved, setInvoiceSaved] = useState(false)

  const monthIdx  = ((monthOffset % 12) + 12) % 12
  const monthLabel = MONTHS[monthIdx] + ' 2025'
  const periodKey  = SHORT_MONTHS[monthIdx] + ' 2025'

  const currentEntry = entries.find(e => e.period === periodKey)
  const isPaid       = currentEntry?.status === 'paid'

  const rpm      = parseFloat(rpmInvoice) || 0
  const ccm      = parseFloat(ccmInvoice) || 0
  const total    = rpm + ccm
  const fee      = clinic.billerFeeType === 'pct' ? total * (clinic.billerFeeVal / 100) : clinic.billerFeeVal
  const feeLabel = clinic.billerFeeType === 'pct' ? `${clinic.billerFeeVal}% of total` : `Fixed $${clinic.billerFeeVal}`

  const rClinic = rpm * (clinic.rpmSplit[0] / 100)
  const rHicare = rpm * (clinic.rpmSplit[1] / 100)
  const cClinic = ccm * (clinic.ccmSplit[0] / 100)
  const cHicare = ccm * (clinic.ccmSplit[1] / 100)

  const rpmCalcRows = clinic.services.includes('RPM') && rpm > 0 ? [
    { label:'Clinic share', value: fmt(rClinic) },
    { label:'Hicare share', value: fmt(rHicare) },
  ] : []

  const ccmCalcRows = clinic.services.includes('CCM') && ccm > 0 ? [
    { label:'Clinic share', value: fmt(cClinic) },
    { label:'Hicare share', value: fmt(cHicare) },
  ] : []

  const infoText = `Split ratios from clinic settings · RPM ${clinic.rpmSplit[0]}/${clinic.rpmSplit[1]} · CCM ${clinic.ccmSplit[0]}/${clinic.ccmSplit[1]} · ${clinic.billerFeeType === 'pct' ? `Biller fee ${clinic.billerFeeVal}%` : `Biller fee $${clinic.billerFeeVal} fixed`}`

  function handleSaveInvoice() {
    onSaveEntry({
      period:  periodKey,
      rpmInv:  rpm,
      ccmInv:  ccm,
      ciTotal: currentEntry?.ciTotal ?? null,
      status:  currentEntry?.status  ?? 'unpaid',
    })
    setInvoiceSaved(true)
    setTimeout(() => setInvoiceSaved(false), 2000)
  }

  function handleSaveCi(amount: number | null) {
    onSaveEntry({
      period:  periodKey,
      rpmInv:  currentEntry?.rpmInv ?? rpm,
      ccmInv:  currentEntry?.ccmInv ?? ccm,
      ciTotal: amount,
      status:  amount != null && amount > 0 ? 'paid' : (currentEntry?.status ?? 'unpaid'),
    })
  }

  return (
    <div className="flex flex-col gap-3.5 px-6 py-5">

      {/* Billing period navigator */}
      <div className="flex items-center gap-2.5">
        <button onClick={() => setMonthOffset(v => v - 1)}
          className="w-7 h-7 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 flex items-center justify-center cursor-pointer bg-white">‹</button>
        <span className="text-[14px] font-semibold text-slate-700 min-w-[120px] text-center">{monthLabel}</span>
        <button onClick={() => setMonthOffset(v => v + 1)}
          className="w-7 h-7 border border-slate-200 rounded-md text-slate-500 hover:bg-slate-50 flex items-center justify-center cursor-pointer bg-white">›</button>
        <span className={`text-[11px] px-2.5 py-1 rounded-full ${isPaid ? 'bg-[#EAF3DE] text-[#27500A]' : 'bg-[#FCEBEB] text-[#791F1F]'}`}>
          {isPaid ? 'Paid' : 'Unpaid'}
        </span>
      </div>

      {/* Invoice */}
      <Card>
        <CardHeader icon="receipt_long" title="Invoice" />
        <CardBody padding="sm">
          <ServiceBlock
            type="RPM"
            splitLabel={`Clinic ${clinic.rpmSplit[0]}% · Hicare ${clinic.rpmSplit[1]}%`}
            disabled={!clinic.services.includes('RPM')}
            invoice={rpmInvoice} pts={rpmPts}
            calcRows={rpmCalcRows}
            onInvoice={setRpmInvoice} onPts={setRpmPts}
          />
          <ServiceBlock
            type="CCM"
            splitLabel={`Clinic ${clinic.ccmSplit[0]}% · Hicare ${clinic.ccmSplit[1]}%`}
            disabled={!clinic.services.includes('CCM')}
            invoice={ccmInvoice} pts={ccmPts}
            calcRows={ccmCalcRows}
            onInvoice={setCcmInvoice} onPts={setCcmPts}
          />

          {total > 0 && (
            <TotalCard rows={[
              { label:'Total invoice',            value: fmt(total),                   color:'text-[#0C447C]' },
              { label:'Total clinic amount',      value: fmt(rClinic + cClinic) },
              { label:`Biller fee (${feeLabel})`, value: `− ${fmt(fee)}`,              color:'text-[#791F1F]' },
              { label:'Total Hicare amount',      value: fmt(rHicare + cHicare - fee), bold: true },
            ]} />
          )}

          <div className="flex items-center gap-2 mt-3 px-3 py-2.5 bg-[#E6F1FB] rounded-md text-[11px] text-[#0C447C] leading-relaxed">
            <span className="material-symbols-outlined text-[14px] flex-shrink-0">info</span>
            <span>{infoText}</span>
          </div>
        </CardBody>
      </Card>

      {/* HicareNet Collection */}
      <Card>
        <CardHeader icon="account_balance" title="HicareNet Collection" />
        <CardBody padding="sm">
          <CISection
            clinic={clinic}
            rpmInv={rpm}
            ccmInv={ccm}
            fee={fee}
            savedCiAmount={currentEntry?.ciTotal ?? null}
            onSaveCi={handleSaveCi}
          />
        </CardBody>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2.5 pb-6">
        {invoiceSaved && (
          <span className="flex items-center gap-1 text-[12px] text-[#27500A]">
            <span className="material-symbols-outlined text-[14px]">check_circle</span>
            Saved
          </span>
        )}
        <Button variant="ghost" size="sm">Cancel</Button>
        <Button variant="secondary" size="sm" onClick={handleSaveInvoice}>Save entry</Button>
      </div>
    </div>
  )
}
