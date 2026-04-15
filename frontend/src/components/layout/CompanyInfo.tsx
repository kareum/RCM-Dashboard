import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { useCompanyInfo, type CompanyInfo } from './useCompanyInfo'

// ── 필드 헬퍼 ────────────────────────────────────────────────
function Field({
  label,
  value,
  placeholder,
  hint,
  multiline,
  onChange,
}: {
  label:        string
  value:        string
  placeholder?: string
  hint?:        string
  multiline?:   boolean
  onChange:     (v: string) => void
}) {
  const cls = 'w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all resize-none'
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {multiline
        ? <textarea rows={2} className={cls} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
        : <input    className={cls} value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
      }
      {hint && <p className="text-[10px] text-slate-400 mt-1">{hint}</p>}
    </div>
  )
}

// ── CompanyInfoModal ─────────────────────────────────────────
function CompanyInfoModal({
  open,
  onClose,
}: {
  open:    boolean
  onClose: () => void
}) {
  const { company, setCompany } = useCompanyInfo()
  const [draft, setDraft] = useState<CompanyInfo>(company)

  function handleOpen() { setDraft(company) }
  function save() { setCompany(draft); onClose() }

  // Modal이 열릴 때 draft를 최신 company로 동기화
  if (open && draft !== company && JSON.stringify(draft) === JSON.stringify(company)) {
    handleOpen()
  }

  function set(key: keyof CompanyInfo) {
    return (v: string) => setDraft(p => ({ ...p, [key]: v }))
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Company Settings"
      subtitle="Invoice에 사용되는 회사 공통 정보"
      size="md"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900 transition-colors cursor-pointer bg-transparent border-none"
          >
            Cancel
          </button>
          <button
            onClick={save}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors cursor-pointer border-none"
          >
            Save
          </button>
        </>
      }
    >
      <div className="space-y-4">

        {/* Logo */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Company Logo</label>
          <div className="flex items-center gap-3">
            {draft.logo
              ? <img src={draft.logo} alt="logo" className="h-10 w-10 rounded-lg object-contain border border-slate-200" />
              : <div className="h-10 w-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400 text-base">business</span>
                </div>
            }
            <input
              type="file"
              accept="image/*"
              className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100 cursor-pointer"
              onChange={e => {
                const file = e.target.files?.[0]
                if (file) setDraft(p => ({ ...p, logo: URL.createObjectURL(file) }))
              }}
            />
          </div>
        </div>

        <div className="h-px bg-slate-100" />

        {/* Contact */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone"                value={draft.phone}   placeholder="+1 (000) 000-0000"     onChange={set('phone')} />
          <Field label="Representative Email" value={draft.email}   placeholder="billing@company.com"   onChange={set('email')} />
        </div>
        <Field label="Address" value={draft.address} placeholder="123 Main St, City, State ZIP" onChange={set('address')} />
        <Field label="Website" value={draft.website} placeholder="https://"                     onChange={set('website')} />

        <div className="h-px bg-slate-100" />

        {/* Payment */}
        <p className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-slate-400">account_balance</span>
          Payment Method
        </p>
        <Field
          label="By Check" value={draft.payByCheck} multiline
          placeholder="Payee: Company Name&#10;Address"
          hint="Invoice에 표시될 수취인 및 발송 주소"
          onChange={set('payByCheck')}
        />
        <Field
          label="By Zelle" value={draft.payByZelle} multiline
          placeholder="Cell Phone or Email&#10;Name"
          hint="Zelle 수신 번호/이메일 및 이름"
          onChange={set('payByZelle')}
        />

      </div>
    </Modal>
  )
}

// ── CompanyInfo (버튼 + Modal 일체형) ────────────────────────
// TopNav 또는 SideNav 어디에든 배치 가능
export function CompanyInfo() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="material-symbols-outlined hover:text-blue-600 transition-colors cursor-pointer bg-transparent border-none p-0"
        title="Company Settings"
      >
        settings
      </button>

      <CompanyInfoModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
