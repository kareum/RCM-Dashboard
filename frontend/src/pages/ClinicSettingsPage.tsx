import { useState, useEffect, useCallback } from 'react'
import {
  Badge, Button, Card, CardHeader, CardBody,
  TextInput, Spinner, Toast, Modal,
  Table, TableHeader, TableRow, TableCell,
  FieldLabel, FieldValue, HintText,
} from '../components/ui'
import { useTopNavActions } from '../components/layout/TopNavActionsContext'
import { useClinics }       from '../hooks/useClinics'
import { useClinicSettings, splitPeriodLabel, feePeriodLabel } from '../hooks/useClinicSettings'
import type { EmrLink }     from '../hooks/useClinicSettings'
import { ClinicListPanel }  from '../components/shared/ClinicListPanel'
import type { ServiceType } from '../data/clinics'

// ── 컴포넌트 ────────────────────────────────────────────────
export function ClinicSettingsPage() {
  const [activeId,     setActiveId]     = useState(1)
  const [isSyncing,    setIsSyncing]    = useState(false)
  const [emrLinks,     setEmrLinks]     = useState<(EmrLink & { _key: number })[]>([])
  const [newEmr,       setNewEmr]       = useState({ name:'', url:'' })
  const [historyModal, setHistoryModal] = useState<{ open:boolean; type: ServiceType|'fee' }>({ open:false, type:'RPM' })
  const [toast,        setToast]        = useState({ visible:false, message:'', variant:'success' as 'success'|'error' })

  const { clinics }                       = useClinics()
  const clinic                            = clinics.find(c => c.id === activeId) ?? clinics[0]
  const { detail, loading, saveEmrLinks, triggerSync } = useClinicSettings(clinic.dbId)
  const { setActions }                    = useTopNavActions()

  const showToast = useCallback((message: string, variant: 'success'|'error' = 'success') => {
    setToast({ visible:true, message, variant })
  }, [])

  // detail 로드되면 EMR 링크 초기화 (클리닉 변경 시에만 초기화)
  useEffect(() => {
    if (!detail) return
    setEmrLinks((detail.emrLinks ?? []).map((e, i) => ({ ...e, _key: i })))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail?.id])

  // lastSyncedAt 표시 문자열
  const lastSyncedLabel = detail?.lastSyncedAt
    ? new Date(detail.lastSyncedAt).toLocaleString('en-US', { month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hour12:false })
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
          {isSyncing ? 'Syncing…' : lastSyncedLabel.slice(-5)}
        </span>
      </button>
    )
    return () => setActions(null)
  }, [isSyncing, lastSyncedLabel, handleSync, setActions])

  // EMR
  function addEmr() {
    if (!newEmr.name || !newEmr.url) { showToast('EMR name and URL are required', 'error'); return }
    setEmrLinks(prev => [...prev, { ...newEmr, _key: Date.now() }])
    setNewEmr({ name:'', url:'' })
  }
  function removeEmr(key: number) { setEmrLinks(prev => prev.filter(e => e._key !== key)) }
  async function saveEmr() {
    try {
      await saveEmrLinks(emrLinks.map(({ name, url }) => ({ name, url })))
      showToast('EMR links saved')
    } catch {
      showToast('Failed to save EMR links', 'error')
    }
  }

  // Revenue Split — 서비스별 최신 기록
  const splitByType = (svc: ServiceType) =>
    detail?.revenueSplitHistory.find(s => s.serviceType === svc) ?? null

  // Biller Fee — 최신 기록
  const currentFee = detail?.billerFeeHistory[0] ?? null

  // History modal 데이터
  const splitHistoryRows = historyModal.type !== 'fee'
    ? (detail?.revenueSplitHistory.filter(s => s.serviceType === historyModal.type) ?? [])
    : []
  const feeHistoryRows = historyModal.type === 'fee'
    ? (detail?.billerFeeHistory ?? [])
    : []

  // 서비스 목록 (DB 기준)
  const services = detail?.serviceTypes ?? clinic.services

  return (
    <div className="flex flex-1 overflow-hidden h-full">

      {/* ── 좌측: 클리닉 목록 ── */}
      <ClinicListPanel activeId={activeId} onSelect={id => { setActiveId(id) }} />

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
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {detail?.name ?? clinic.name}
                </h2>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                    {detail?.code ?? clinic.code}
                  </span>
                  <Badge variant={(detail?.isActive ?? clinic.active) ? 'active' : 'inactive'} dot>
                    {(detail?.isActive ?? clinic.active) ? 'Active Provider' : 'Inactive'}
                  </Badge>
                  {services.map(s => (
                    <Badge key={s} variant={s.toLowerCase() as 'rpm'|'ccm'}>{s}</Badge>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* ① Basic Information */}
          <Card>
            <CardHeader icon="location_on" title="Basic Information" badge={<ReadOnlyBadge />} />
            {loading && !detail ? (
              <CardBody><Spinner size="sm" /></CardBody>
            ) : (
              <CardBody className="grid grid-cols-2 gap-x-8 gap-y-5">
                <div><FieldLabel>Clinic Name</FieldLabel><FieldValue>{detail?.name ?? '—'}</FieldValue></div>
                <div><FieldLabel>Clinic Code</FieldLabel><FieldValue mono>{detail?.code ?? '—'}</FieldValue></div>
                <div><FieldLabel>Contact Name</FieldLabel><FieldValue>{detail?.contactName ?? '—'}</FieldValue></div>
                <div><FieldLabel>Phone</FieldLabel><FieldValue>{detail?.phone ?? '—'}</FieldValue></div>
                <div><FieldLabel>Timezone</FieldLabel><FieldValue>{detail?.timezone ?? '—'}</FieldValue></div>
                <div><FieldLabel>State</FieldLabel><FieldValue>{detail?.state ?? '—'}</FieldValue></div>
                <div className="col-span-2">
                  <FieldLabel>Address</FieldLabel>
                  <FieldValue>{detail?.address ?? '—'}</FieldValue>
                </div>
              </CardBody>
            )}
          </Card>

          {/* ② Service Type */}
          <Card>
            <CardHeader icon="list_alt" title="Service Type" badge={<ReadOnlyBadge />} />
            <CardBody>
              <div className="flex gap-3 flex-wrap">
                {(['RPM', 'CCM'] as ServiceType[]).map(svc => {
                  const isActive = services.includes(svc)
                  return (
                    <div
                      key={svc}
                      className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${
                        isActive ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-40'
                      }`}
                    >
                      <Badge variant={svc.toLowerCase() as 'rpm'|'ccm'} dot>{svc}</Badge>
                    </div>
                  )
                })}
                {(['BHI', 'PCM'] as const).map(svc => (
                  <div key={svc} className="flex items-center px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 opacity-40">
                    <span className="text-xs font-medium text-slate-400">{svc}</span>
                  </div>
                ))}
              </div>
              <HintText>활성 서비스만 Invoice 입력 및 Revenue Split 테이블에 표시됩니다.</HintText>
            </CardBody>
          </Card>

          {/* ③ Revenue Split */}
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
                  if (!services.includes(svc)) return null
                  const current = splitByType(svc)
                  return (
                    <TableRow key={svc}>
                      <TableCell>
                        <Badge variant={svc.toLowerCase() as 'rpm'|'ccm'}>{svc}</Badge>
                      </TableCell>
                      <TableCell>
                        {current ? (
                          <>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="rpm">Clinic {current.clinicPct}%</Badge>
                              <Badge variant="ccm">Hicare {current.hicarePct}%</Badge>
                            </div>
                            <div className="mt-2 h-1.5 w-36 bg-slate-100 rounded-full overflow-hidden flex">
                              <div className="h-full bg-primary" style={{ width:`${current.clinicPct}%` }} />
                              <div className="h-full bg-blue-200" style={{ width:`${current.hicarePct}%` }} />
                            </div>
                          </>
                        ) : <span className="text-slate-400 text-sm">—</span>}
                      </TableCell>
                      <TableCell mono muted>{current?.effectiveFrom ?? '—'}</TableCell>
                      <TableCell align="right">
                        <Button variant="ghost" size="sm" onClick={() => setHistoryModal({ open:true, type:svc })}>
                          View history
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </tbody>
            </Table>
          </Card>

          {/* ④ Biller Fee */}
          <Card>
            <CardHeader icon="receipt" title="Biller Fee" badge={<ReadOnlyBadge />} />
            <CardBody>
              {currentFee ? (
                <>
                  <div className="grid grid-cols-3 gap-8 items-end">
                    <div>
                      <FieldLabel>Fee Type</FieldLabel>
                      <FieldValue>{currentFee.feeType === 'pct' ? 'Percentage (%)' : 'Fixed ($/mo)'}</FieldValue>
                    </div>
                    <div>
                      <FieldLabel>Fee Value</FieldLabel>
                      <p className="text-2xl font-extrabold text-slate-900 mt-1">
                        {currentFee.feeType === 'pct'
                          ? `${Math.abs(currentFee.feeValue)}%`
                          : `$${Math.abs(currentFee.feeValue)}/mo`}
                      </p>
                    </div>
                    <div><FieldLabel>Effective From</FieldLabel><FieldValue mono>{currentFee.effectiveFrom}</FieldValue></div>
                  </div>
                  {currentFee.note && (
                    <p className="mt-3 text-[11px] text-slate-500 bg-slate-50 rounded-lg p-3">{currentFee.note}</p>
                  )}
                </>
              ) : (
                <span className="text-slate-400 text-sm">—</span>
              )}
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={() => setHistoryModal({ open:true, type:'fee' })}>
                  View history
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* ⑤ EMR Access */}
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
              <div className="space-y-2 mb-4">
                {emrLinks.map(emr => (
                  <div key={emr._key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group">
                    <span className="material-symbols-outlined text-slate-400 text-sm flex-shrink-0">link</span>
                    <span className="w-28 text-sm font-semibold text-slate-700 flex-shrink-0">{emr.name}</span>
                    <input
                      className="flex-1 text-xs font-mono bg-transparent border-none outline-none text-primary focus:bg-white focus:px-2 focus:border focus:border-blue-300 focus:rounded transition-all"
                      value={emr.url}
                      onChange={e => setEmrLinks(prev =>
                        prev.map(l => l._key === emr._key ? { ...l, url: e.target.value } : l)
                      )}
                    />
                    <Button variant="ghost" size="sm" iconOnly className="opacity-0 group-hover:opacity-100"
                      onClick={() => window.open(emr.url, '_blank')}>
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </Button>
                    <Button variant="ghost" size="sm" iconOnly className="opacity-0 group-hover:opacity-100 hover:text-error"
                      onClick={() => removeEmr(emr._key)}>
                      <span className="material-symbols-outlined text-sm">close</span>
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <TextInput className="w-32" placeholder="EMR name"
                  value={newEmr.name} onChange={e => setNewEmr(p => ({ ...p, name: e.target.value }))} />
                <TextInput className="flex-1" placeholder="https://..."
                  value={newEmr.url} onChange={e => setNewEmr(p => ({ ...p, url: e.target.value }))} />
                <Button variant="secondary" leftIcon={<span className="material-symbols-outlined text-sm">add</span>} onClick={addEmr}>
                  Add EMR
                </Button>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <Button variant="ghost" onClick={() => {
                  setEmrLinks((detail?.emrLinks ?? []).map((e, i) => ({ ...e, _key: i })))
                }}>Cancel</Button>
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
        title={historyModal.type === 'fee' ? 'Biller Fee History' : `${historyModal.type} Split History`}
        subtitle="변경 이력 (소급 적용 없음)"
      >
        <div className="space-y-3">
          {historyModal.type === 'fee'
            ? feeHistoryRows.map((row, idx) => (
                <HistoryItem key={row.id} isCurrent={idx === 0}
                  period={feePeriodLabel(feeHistoryRows, idx)}
                  changedAt={new Date(row.changedAt).toLocaleDateString()}
                  detail={
                    <span className="text-sm font-bold text-slate-800">
                      {row.feeType === 'pct' ? 'Percentage' : 'Fixed'} · {
                        row.feeType === 'pct'
                          ? `${Math.abs(row.feeValue)}%`
                          : `$${Math.abs(row.feeValue)}/mo`
                      }
                    </span>
                  }
                />
              ))
            : splitHistoryRows.map((row, idx) => (
                <HistoryItem key={row.id} isCurrent={idx === 0}
                  period={splitPeriodLabel(splitHistoryRows, idx)}
                  changedAt={new Date(row.changedAt).toLocaleDateString()}
                  detail={
                    <>
                      <Badge variant="rpm">Clinic {row.clinicPct}%</Badge>
                      <Badge variant="ccm">Hicare {row.hicarePct}%</Badge>
                    </>
                  }
                />
              ))
          }
          {(historyModal.type === 'fee' ? feeHistoryRows : splitHistoryRows).length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">이력 없음</p>
          )}
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

function HistoryItem({ isCurrent, period, changedAt, detail }: {
  isCurrent: boolean
  period:    string
  changedAt: string
  detail:    React.ReactNode
}) {
  return (
    <div className={`flex gap-3 p-3 rounded-lg ${isCurrent ? 'bg-blue-50/60 border border-blue-100' : 'bg-slate-50'}`}>
      <span className={`h-2 w-2 rounded-full mt-1.5 flex-shrink-0 ${isCurrent ? 'bg-primary' : 'bg-slate-300'}`} />
      <div className="flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          {detail}
          {isCurrent && <Badge variant="active">현재 적용</Badge>}
        </div>
        <p className="text-[10px] text-slate-400 mt-1">{period} · 변경일 {changedAt}</p>
      </div>
    </div>
  )
}
