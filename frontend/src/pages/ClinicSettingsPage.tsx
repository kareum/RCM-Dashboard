import { useState, useEffect, useCallback } from 'react'
import {
  Badge, Button, Card, CardHeader, CardBody,
  TextInput, Spinner, Toast, Modal,
  Table, TableHeader, TableRow, TableCell,
  FieldLabel, FieldValue, HintText,
} from '../components/ui'
import { useTopNavActions } from '../components/layout/TopNavActionsContext'
import { useClinics }       from '../hooks/useClinics'
import { ClinicListPanel }  from '../components/shared/ClinicListPanel'
import type { ServiceType } from '../data/clinics'

interface EmrLink {
  id:   number
  name: string
  url:  string
}

interface SplitHistory {
  period:    string
  clinic:    number
  hicare:    number
  changedAt: string
}

interface FeeHistory {
  period:    string
  type:      string
  val:       string
  changedAt: string
}

// ── 목 데이터 ───────────────────────────────────────────────
const ACTIVE_PATIENTS: Record<number, Partial<Record<ServiceType, number>>> = {
  1:  { RPM: 142, CCM: 87  },
  2:  { RPM: 58              },
  3:  {           CCM: 34  },
  4:  { RPM: 201, CCM: 115 },
  5:  { RPM: 76              },
  6:  { RPM: 93,  CCM: 61  },
  7:  {           CCM: 0   },
  8:  { RPM: 167, CCM: 98  },
  9:  { RPM: 44              },
  10: { RPM: 130, CCM: 72  },
  11: {           CCM: 0   },
  12: { RPM: 29              },
}

const SPLIT_HISTORY: Partial<Record<ServiceType, SplitHistory[]>> = {
  RPM: [
    { period:'2025-03 ~ 현재',    clinic:50, hicare:50, changedAt:'2025-03-01' },
    { period:'2025-01 ~ 2025-02', clinic:40, hicare:60, changedAt:'2025-01-01' },
  ],
  CCM: [
    { period:'2025-03 ~ 현재',    clinic:60, hicare:40, changedAt:'2025-03-10' },
    { period:'2024-06 ~ 2025-02', clinic:50, hicare:50, changedAt:'2024-06-01' },
    { period:'2024-01 ~ 2024-05', clinic:45, hicare:55, changedAt:'2024-01-01' },
  ],
}

const FEE_HISTORY: FeeHistory[] = [
  { period:'2025-01 ~ 현재',    type:'Percentage', val:'5.0%',    changedAt:'2025-01-01' },
  { period:'2024-01 ~ 2024-12', type:'Fixed',      val:'$200/mo', changedAt:'2024-01-01' },
]

// ── 컴포넌트 ────────────────────────────────────────────────
export function ClinicSettingsPage() {
  const [activeId,   setActiveId]   = useState(1)
  const [isSyncing,  setIsSyncing]  = useState(false)
  const [lastSynced, setLastSynced] = useState('2026-04-08 09:32')
  const [emrLinks,   setEmrLinks]   = useState<EmrLink[]>([
    { id:1, name:'AthenaHealth', url:'https://athenanet.athenahealth.com/1234' },
    { id:2, name:'Epic MyChart', url:'https://mychart.epic.com/sunrise' },
  ])
  const [newEmr,     setNewEmr]     = useState({ name:'', url:'' })
  const [historyModal, setHistoryModal] = useState<{ open:boolean; type: ServiceType|'fee' }>({ open:false, type:'RPM' })
  const [toast,      setToast]      = useState({ visible:false, message:'', variant:'success' as 'success'|'error' })

  const { clinics } = useClinics()
  const clinic = clinics.find(c => c.id === activeId) ?? clinics[0]
  const { setActions } = useTopNavActions()

  const showToast = useCallback((message: string, variant: 'success'|'error' = 'success') => {
    setToast({ visible:true, message, variant })
  }, [])

  const handleSync = useCallback(() => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      const now = new Date().toISOString().slice(0,16).replace('T',' ')
      setLastSynced(now)
      showToast('Sync complete — data updated')
    }, 1800)
  }, [showToast])

  // TopNav에 sync 컨트롤 등록
  useEffect(() => {
    setActions(
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className="flex flex-col items-center gap-0.5 group disabled:cursor-not-allowed"
        title="Sync clinic data"
      >
        {isSyncing
          ? <Spinner size="sm" />
          : <span className="material-symbols-outlined text-[22px] text-slate-500 group-hover:text-blue-600 transition-colors group-hover:rotate-180 transition-transform duration-500">sync</span>
        }
        <span className="text-[9px] text-slate-400 group-hover:text-blue-500 transition-colors leading-none">
          {isSyncing ? 'Syncing…' : lastSynced.slice(11)}
        </span>
      </button>
    )
    return () => setActions(null)
  }, [isSyncing, lastSynced, handleSync, setActions])

  // EMR
  function addEmr() {
    if (!newEmr.name || !newEmr.url) { showToast('EMR name and URL are required', 'error'); return }
    setEmrLinks(prev => [...prev, { id: Date.now(), ...newEmr }])
    setNewEmr({ name:'', url:'' })
  }
  function removeEmr(id: number) { setEmrLinks(prev => prev.filter(e => e.id !== id)) }
  function saveEmr() { showToast('EMR links saved') }

  // History modal 내용
  const historyRows =
    historyModal.type === 'fee'
      ? FEE_HISTORY
      : SPLIT_HISTORY[historyModal.type as ServiceType]

  return (
    <div className="flex flex-1 overflow-hidden h-full">

      {/* ── 좌측: 클리닉 목록 ── */}
      <ClinicListPanel activeId={activeId} onSelect={setActiveId} />

      {/* ── 우측: 클리닉 상세 ── */}
      <section className="flex-1 bg-page-bg overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8 space-y-5">

          {/* 클리닉 헤더 */}
          <Card>
            <CardBody className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-2xl icon-filled">local_hospital</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{clinic.name}</h2>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                    {clinic.code}
                  </span>
                  <Badge variant={clinic.active ? 'active' : 'inactive'} dot>
                    {clinic.active ? 'Active Provider' : 'Inactive'}
                  </Badge>
                  {clinic.services.map(s => (
                    <Badge key={s} variant={s.toLowerCase() as 'rpm'|'ccm'}>{s}</Badge>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* ① Basic Information */}
          <Card>
            <CardHeader icon="location_on" title="Basic Information" badge={<ReadOnlyBadge />} />
            <CardBody className="grid grid-cols-2 gap-x-8 gap-y-5">
              <div><FieldLabel>Clinic Name</FieldLabel><FieldValue>Sunrise Health Center</FieldValue></div>
              <div><FieldLabel>Clinic Code</FieldLabel><FieldValue mono>SDW</FieldValue></div>
              <div><FieldLabel>Contact Name</FieldLabel><FieldValue>Dr. James Kim</FieldValue></div>
              <div><FieldLabel>Phone</FieldLabel><FieldValue>+1 (310) 555-0182</FieldValue></div>
              <div><FieldLabel>Timezone</FieldLabel><FieldValue>America/Los_Angeles (PT)</FieldValue></div>
              <div><FieldLabel>State</FieldLabel><FieldValue>CA — California</FieldValue></div>
              <div className="col-span-2">
                <FieldLabel>Address</FieldLabel>
                <FieldValue>3250 Wilshire Blvd, Suite 400, Los Angeles, CA 90010</FieldValue>
              </div>
            </CardBody>
          </Card>

          {/* ② Service Type */}
          <Card>
            <CardHeader icon="list_alt" title="Service Type" badge={<ReadOnlyBadge />} />
            <CardBody>
              <div className="flex gap-3 flex-wrap">
                {(['RPM', 'CCM'] as ServiceType[]).map(svc => {
                  const isActive = clinic.services.includes(svc)
                  const count = ACTIVE_PATIENTS[clinic.id]?.[svc]
                  return (
                    <div
                      key={svc}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
                        isActive
                          ? 'bg-white border-slate-200'
                          : 'bg-slate-50 border-slate-100 opacity-40'
                      }`}
                    >
                      <Badge variant={svc.toLowerCase() as 'rpm' | 'ccm'} dot>{svc}</Badge>
                      {isActive && count !== undefined && (
                        <div className="flex items-center gap-1 pl-3 border-l border-slate-200">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                          <span className="text-sm font-semibold text-slate-700">{count.toLocaleString()}</span>
                          <span className="text-[10px] text-slate-400">active</span>
                        </div>
                      )}
                    </div>
                  )
                })}
                {(['BHI', 'PCM'] as const).map(svc => (
                  <div key={svc} className="flex items-center px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 opacity-40">
                    <span className="px-0 text-xs font-medium text-slate-400">{svc}</span>
                  </div>
                ))}
              </div>
              <HintText>활성 서비스만 Invoice 입력 및 Revenue Split 테이블에 표시됩니다.</HintText>
            </CardBody>
          </Card>

          {/* ③ CMS-1500 Billing Info */}
          {/* TODO: 2차 적용 예정
          <Card>
            <CardHeader icon="description" title="CMS-1500 Billing Info" badge={<ReadOnlyBadge />} />
            <CardBody>
              <div className="flex items-start gap-2 p-3 bg-blue-50/60 rounded-lg mb-5">
                <span className="material-symbols-outlined text-blue-500 text-base flex-shrink-0 mt-0.5">info</span>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  클리닉 공통 값 — 모든 청구서(CMS-1500)에 자동으로 채워집니다. 환자별로 달라지지 않습니다.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-x-8 gap-y-5">
                <div>
                  <FieldLabel sub="Box 25">Federal Tax ID (EIN)</FieldLabel>
                  <FieldValue mono>12-3456789</FieldValue>
                  <HintText>사업자 세금 식별번호</HintText>
                </div>
                <div>
                  <FieldLabel sub="Box 33a">Billing Provider NPI</FieldLabel>
                  <FieldValue mono>1234567890</FieldValue>
                  <HintText>National Provider Identifier</HintText>
                </div>
                <div>
                  <FieldLabel sub="Box 33b">Taxonomy Code</FieldLabel>
                  <FieldValue mono>207Q00000X</FieldValue>
                  <HintText>Provider specialty code</HintText>
                </div>
                <div>
                  <FieldLabel sub="Box 24B">Place of Service (POS)</FieldLabel>
                  <FieldValue>11 — Office</FieldValue>
                  <HintText>RPM/CCM은 보통 11 또는 02</HintText>
                </div>
                <div>
                  <FieldLabel sub="Box 27">Accept Assignment</FieldLabel>
                  <div className="mt-2">
                    <Toggle checked={true} disabled label="Yes" />
                  </div>
                  <HintText>Medicare 청구 시 Yes 권장</HintText>
                </div>
              </div>
            </CardBody>
          </Card>
          */}

          {/* ④ Revenue Split */}
          <Card>
            <CardHeader icon="account_balance" title="Revenue Split (Clinic : Hicare)" badge={<ReadOnlyBadge />} />
            <Table>
              <TableHeader columns={[
                { label:'Service', width:'w-24' },
                { label:'Split' },
                { label:'Effective From', width:'w-32' },
                { label:'', width:'w-28' },
              ]} />
              <tbody>
                {(['RPM','CCM'] as ServiceType[]).map(svc => {
                  const current = SPLIT_HISTORY[svc]?.[0]
                  if (!current) return null
                  return (
                    <TableRow key={svc}>
                      <TableCell>
                        <Badge variant={svc.toLowerCase() as 'rpm'|'ccm'}>{svc}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="rpm">Clinic {current.clinic}%</Badge>
                          <Badge variant="ccm">Hicare {current.hicare}%</Badge>
                        </div>
                        <div className="mt-2 h-1.5 w-36 bg-slate-100 rounded-full overflow-hidden flex">
                          <div className="h-full bg-primary" style={{ width:`${current.clinic}%` }} />
                          <div className="h-full bg-blue-200" style={{ width:`${current.hicare}%` }} />
                        </div>
                      </TableCell>
                      <TableCell mono muted>2025-03</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setHistoryModal({ open:true, type:svc })}
                        >
                          View history
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </tbody>
            </Table>
          </Card>

          {/* ⑤ Biller Fee */}
          <Card>
            <CardHeader icon="receipt" title="Biller Fee" badge={<ReadOnlyBadge />} />
            <CardBody>
              <div className="grid grid-cols-3 gap-8 items-end">
                <div><FieldLabel>Fee Type</FieldLabel><FieldValue>Percentage (%)</FieldValue></div>
                <div>
                  <FieldLabel>Fee Value</FieldLabel>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">5.0%</p>
                </div>
                <div><FieldLabel>Effective From</FieldLabel><FieldValue mono>2025-01</FieldValue></div>
              </div>
              <div className="mt-4 p-3 bg-slate-50 rounded-lg">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  <span className="font-bold text-slate-600">계산 예시:</span>
                  {' '}Hicare 실수령 = Hicare share − Biller fee &nbsp;·&nbsp; Biller fee = Total invoice × 5.0%
                </p>
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setHistoryModal({ open:true, type:'fee' })}
                >
                  View history
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* ⑥ EMR Access (편집 가능) */}
          <Card>
            <CardHeader
              icon="terminal"
              title="EMR Access"
              badge={
                <span className="flex items-center gap-1 text-[10px] text-tertiary-container bg-tertiary-fixed/30 px-2 py-0.5 rounded-full font-bold">
                  <span className="material-symbols-outlined text-[12px]">edit</span>
                  Editable
                </span>
              }
            />
            <CardBody>
              {/* EMR 목록 */}
              <div className="space-y-2 mb-4">
                {emrLinks.map(emr => (
                  <div key={emr.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group">
                    <span className="material-symbols-outlined text-slate-400 text-sm flex-shrink-0">link</span>
                    <span className="w-28 text-sm font-semibold text-slate-700 flex-shrink-0">{emr.name}</span>
                    <input
                      className="flex-1 text-xs font-mono bg-transparent border-none outline-none text-primary focus:bg-white focus:px-2 focus:border focus:border-blue-300 focus:rounded transition-all"
                      value={emr.url}
                      onChange={e => setEmrLinks(prev =>
                        prev.map(l => l.id === emr.id ? { ...l, url: e.target.value } : l)
                      )}
                    />
                    <Button
                      variant="ghost" size="sm" iconOnly
                      className="opacity-0 group-hover:opacity-100"
                      onClick={() => window.open(emr.url, '_blank')}
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </Button>
                    <Button
                      variant="ghost" size="sm" iconOnly
                      className="opacity-0 group-hover:opacity-100 hover:text-error"
                      onClick={() => removeEmr(emr.id)}
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </Button>
                  </div>
                ))}
              </div>

              {/* EMR 추가 */}
              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <TextInput
                  className="w-32"
                  placeholder="EMR name"
                  value={newEmr.name}
                  onChange={e => setNewEmr(p => ({ ...p, name: e.target.value }))}
                />
                <TextInput
                  className="flex-1"
                  placeholder="https://..."
                  value={newEmr.url}
                  onChange={e => setNewEmr(p => ({ ...p, url: e.target.value }))}
                />
                <Button
                  variant="secondary"
                  leftIcon={<span className="material-symbols-outlined text-sm">add</span>}
                  onClick={addEmr}
                >
                  Add EMR
                </Button>
              </div>

              {/* 저장 */}
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <Button variant="ghost" onClick={() => {}}>Cancel</Button>
                <Button variant="primary" onClick={saveEmr}>Save EMR links</Button>
              </div>
            </CardBody>
          </Card>

        </div>
      </section>

      {/* ── History Modal ── */}
      <Modal
        open={historyModal.open}
        onClose={() => setHistoryModal(p => ({ ...p, open:false }))}
        title={
          historyModal.type === 'fee' ? 'Biller Fee History' :
          `${historyModal.type} Split History`
        }
        subtitle="원서버 기준 변경 이력 (소급 적용 없음)"
      >
        <div className="space-y-3">
          {(historyRows as (SplitHistory|FeeHistory)[]).map((row, idx) => {
            const isCurrent = idx === 0
            const detail = 'clinic' in row
              ? <><Badge variant="rpm">Clinic {row.clinic}%</Badge><Badge variant="ccm">Hicare {row.hicare}%</Badge></>
              : <span className="text-sm font-bold text-slate-800">{(row as FeeHistory).type} · {(row as FeeHistory).val}</span>
            return (
              <div key={idx} className={`flex gap-3 p-3 rounded-lg ${isCurrent ? 'bg-blue-50/60 border border-blue-100' : 'bg-slate-50'}`}>
                <span className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${isCurrent ? 'bg-primary' : 'bg-slate-300'}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {detail}
                    {isCurrent && <Badge variant="active">현재 적용</Badge>}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {row.period} · 변경일 {row.changedAt}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </Modal>

      {/* ── Toast ── */}
      <Toast
        visible={toast.visible}
        message={toast.message}
        variant={toast.variant}
        onClose={() => setToast(p => ({ ...p, visible:false }))}
      />
    </div>
  )
}

// ── 하위 컴포넌트 ────────────────────────────────────────────

function ReadOnlyBadge() {
  return (
    <span className="flex items-center gap-1 text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full">
      <span className="material-symbols-outlined text-[12px]">lock</span>
      Read-only · synced
    </span>
  )
}

