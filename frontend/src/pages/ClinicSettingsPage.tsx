import { useEffect, type ReactNode } from 'react'
import {
  Badge, Button, Card, CardHeader, CardBody,
  TextInput, Spinner, Toast, Modal,
  Table, TableHeader, TableRow, TableCell,
  FieldLabel, FieldValue, HintText,
} from '../components/ui'
import { useTopNavActions }          from '../components/layout/TopNavActionsContext'
import { useClinicSettingsPage }     from '../hooks/useClinicSettingsPage'
import { splitPeriodLabel, feePeriodLabel } from '../hooks/useClinicSettings'
import type { SplitRecord, FeeRecord }      from '../hooks/useClinicSettings'
import { ClinicListPanel }           from '../components/shared/ClinicListPanel'
import type { ServiceType }          from '../data/clinics'

export function ClinicSettingsPage() {
  const page          = useClinicSettingsPage()
  const { setActions } = useTopNavActions()

  // Register sync button in TopNav — UI concern stays in the view layer
  useEffect(() => {
    setActions(
      <button
        onClick={page.handleSync}
        disabled={page.isSyncing}
        className="flex flex-col items-center gap-0.5 group disabled:cursor-not-allowed"
        title="Sync clinic data"
      >
        {page.isSyncing
          ? <Spinner size="sm" />
          : <span className="material-symbols-outlined text-[22px] text-slate-500 group-hover:text-blue-600 transition-colors group-hover:rotate-180 transition-transform duration-500">sync</span>
        }
        <span className="text-[9px] text-slate-400 group-hover:text-blue-500 transition-colors leading-none">
          {page.isSyncing ? 'Syncing…' : page.lastSyncedLabel.slice(-5)}
        </span>
      </button>
    )
    return () => setActions(null)
  }, [page.isSyncing, page.lastSyncedLabel, page.handleSync, setActions])

  return (
    <div className="flex flex-1 overflow-hidden h-full">

      {/* Clinic list */}
      <ClinicListPanel activeId={page.activeId} onSelect={page.selectClinic} />

      {/* Clinic detail */}
      <section className="flex-1 bg-page-bg overflow-y-auto">
        <div className="max-w-3xl mx-auto p-8 space-y-5">

          {/* Clinic header */}
          <Card>
            <CardBody className="flex items-center gap-5">
              <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-2xl icon-filled">local_hospital</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  {page.detail?.name ?? page.clinic.name}
                </h2>
                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                  <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded-lg">
                    {page.detail?.code ?? page.clinic.code}
                  </span>
                  <Badge variant={(page.detail?.isActive ?? page.clinic.active) ? 'active' : 'inactive'} dot>
                    {(page.detail?.isActive ?? page.clinic.active) ? 'Active Provider' : 'Inactive'}
                  </Badge>
                  {page.services.map(s => (
                    <Badge key={s} variant={s.toLowerCase() as 'rpm'|'ccm'}>{s}</Badge>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* ① Basic Information */}
          <Card>
            <CardHeader icon="location_on" title="Basic Information" badge={<ReadOnlyBadge />} />
            {page.loading && !page.detail ? (
              <CardBody><Spinner size="sm" /></CardBody>
            ) : (
              <CardBody className="grid grid-cols-2 gap-x-8 gap-y-5">
                <div><FieldLabel>Clinic Name</FieldLabel><FieldValue>{page.detail?.name ?? '—'}</FieldValue></div>
                <div><FieldLabel>Clinic Code</FieldLabel><FieldValue mono>{page.detail?.code ?? '—'}</FieldValue></div>
                <div><FieldLabel>Contact Name</FieldLabel><FieldValue>{page.detail?.contactName ?? '—'}</FieldValue></div>
                <div><FieldLabel>Phone</FieldLabel><FieldValue>{page.detail?.phone ?? '—'}</FieldValue></div>
                <div><FieldLabel>Timezone</FieldLabel><FieldValue>{page.detail?.timezone ?? '—'}</FieldValue></div>
                <div><FieldLabel>State</FieldLabel><FieldValue>{page.detail?.state ?? '—'}</FieldValue></div>
                <div className="col-span-2">
                  <FieldLabel>Address</FieldLabel>
                  <FieldValue>{page.detail?.address ?? '—'}</FieldValue>
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
                  const isActive = page.services.includes(svc)
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
                { label: 'Service', width: 'w-24' },
                { label: 'Split' },
                { label: 'Effective From', width: 'w-32' },
                { label: '', width: 'w-28' },
              ]} />
              <tbody>
                {(['RPM','CCM'] as ServiceType[]).map(svc => {
                  if (!page.services.includes(svc)) return null
                  const current = page.splitByType(svc)
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
                              <div className="h-full bg-primary" style={{ width: `${current.clinicPct}%` }} />
                              <div className="h-full bg-blue-200" style={{ width: `${current.hicarePct}%` }} />
                            </div>
                          </>
                        ) : <span className="text-slate-400 text-sm">—</span>}
                      </TableCell>
                      <TableCell mono muted>{current?.effectiveFrom ?? '—'}</TableCell>
                      <TableCell align="right">
                        <Button variant="ghost" size="sm" onClick={() => page.openSplitHistory(svc)}>
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
              {page.currentFee ? (
                <>
                  <div className="grid grid-cols-3 gap-8 items-end">
                    <div>
                      <FieldLabel>Fee Type</FieldLabel>
                      <FieldValue>{page.currentFee.feeType === 'pct' ? 'Percentage (%)' : 'Fixed ($/mo)'}</FieldValue>
                    </div>
                    <div>
                      <FieldLabel>Fee Value</FieldLabel>
                      <p className="text-2xl font-extrabold text-slate-900 mt-1">
                        {page.currentFee.feeType === 'pct'
                          ? `${Math.abs(page.currentFee.feeValue)}%`
                          : `$${Math.abs(page.currentFee.feeValue)}/mo`}
                      </p>
                    </div>
                    <div><FieldLabel>Effective From</FieldLabel><FieldValue mono>{page.currentFee.effectiveFrom}</FieldValue></div>
                  </div>
                  {page.currentFee.note && (
                    <p className="mt-3 text-[11px] text-slate-500 bg-slate-50 rounded-lg p-3">{page.currentFee.note}</p>
                  )}
                </>
              ) : (
                <span className="text-slate-400 text-sm">—</span>
              )}
              <div className="mt-4 flex justify-end">
                <Button variant="ghost" size="sm" onClick={page.openFeeHistory}>
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
                {page.emrLinks.map(emr => (
                  <div key={emr._key} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg group">
                    <span className="material-symbols-outlined text-slate-400 text-sm flex-shrink-0">link</span>
                    <span className="w-28 text-sm font-semibold text-slate-700 flex-shrink-0">{emr.name}</span>
                    <input
                      className="flex-1 text-xs font-mono bg-transparent border-none outline-none text-primary focus:bg-white focus:px-2 focus:border focus:border-blue-300 focus:rounded transition-all"
                      value={emr.url}
                      onChange={e => page.updateEmrUrl(emr._key, e.target.value)}
                    />
                    <Button variant="ghost" size="sm" iconOnly className="opacity-0 group-hover:opacity-100"
                      onClick={() => window.open(emr.url, '_blank')}>
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                    </Button>
                    <Button variant="ghost" size="sm" iconOnly className="opacity-0 group-hover:opacity-100 hover:text-error"
                      onClick={() => page.removeEmr(emr._key)}>
                      <span className="material-symbols-outlined text-sm">close</span>
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                <TextInput
                  className="w-32" placeholder="EMR name"
                  value={page.newEmr.name}
                  onChange={e => page.updateNewEmr('name', e.target.value)}
                />
                <TextInput
                  className="flex-1" placeholder="https://..."
                  value={page.newEmr.url}
                  onChange={e => page.updateNewEmr('url', e.target.value)}
                />
                <Button variant="secondary" leftIcon={<span className="material-symbols-outlined text-sm">add</span>} onClick={page.addEmr}>
                  Add EMR
                </Button>
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-100">
                <Button variant="ghost" onClick={page.resetEmrLinks}>Cancel</Button>
                <Button variant="primary" onClick={page.saveEmr}>Save EMR links</Button>
              </div>
            </CardBody>
          </Card>

        </div>
      </section>

      {/* History Modal */}
      <Modal
        open={page.historyModal.open}
        onClose={page.closeHistoryModal}
        title={page.historyModal.type === 'fee' ? 'Biller Fee History' : `${page.historyModal.type} Split History`}
        subtitle="변경 이력 (소급 적용 없음)"
      >
        <div className="space-y-3">
          {page.historyModal.type === 'fee'
            ? page.feeHistoryRows.map((row: FeeRecord, idx: number) => (
                <HistoryItem key={row.id} isCurrent={idx === 0}
                  period={feePeriodLabel(page.feeHistoryRows, idx)}
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
            : page.splitHistoryRows.map((row: SplitRecord, idx: number) => (
                <HistoryItem key={row.id} isCurrent={idx === 0}
                  period={splitPeriodLabel(page.splitHistoryRows, idx)}
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
          {(page.historyModal.type === 'fee' ? page.feeHistoryRows : page.splitHistoryRows).length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">이력 없음</p>
          )}
        </div>
      </Modal>

      {/* Toast */}
      <Toast
        visible={page.toast.visible}
        message={page.toast.message}
        variant={page.toast.variant}
        onClose={page.closeToast}
      />
    </div>
  )
}

// ── Pure UI sub-components ────────────────────────────────────

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
  detail:    ReactNode
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
