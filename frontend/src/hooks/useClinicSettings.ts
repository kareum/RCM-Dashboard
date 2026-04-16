import { useState, useEffect, useCallback } from 'react'

export interface EmrLink {
  name: string
  url:  string
}

export interface SplitRecord {
  id:           string
  serviceType:  'RPM' | 'CCM' | 'BHI' | 'PCM'
  clinicPct:    number
  hicarePct:    number
  effectiveFrom: string
  changedAt:    string
}

export interface FeeRecord {
  id:           string
  feeType:      'pct' | 'fixed'
  feeValue:     number
  effectiveFrom: string
  note:         string | null
  changedAt:    string
}

export interface ClinicDetail {
  id:               string
  name:             string
  code:             string
  state:            string
  timezone:         string | null
  phone:            string | null
  address:          string | null
  contactName:      string | null
  ein:              string | null
  npi:              string | null
  taxonomyCode:     string | null
  posCode:          string | null
  acceptAssignment: boolean
  serviceTypes:     ('RPM' | 'CCM' | 'BHI' | 'PCM')[]
  emrLinks:         EmrLink[]
  isActive:         boolean
  lastSyncedAt:     string | null
  revenueSplitHistory: SplitRecord[]
  billerFeeHistory:    FeeRecord[]
}

/**
 * 클리닉 상세 + split/fee 이력 한 번에 조회 (GET /api/clinics/:id)
 * emrLinks 저장(PATCH), sync(PATCH /:id/sync) 포함
 */
export function useClinicSettings(dbId: string | undefined) {
  const [detail,     setDetail]     = useState<ClinicDetail | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // refreshKey 증가로 재조회 트리거 (saveEmrLinks, triggerSync 에서 호출)
  const reload = useCallback(() => setRefreshKey(k => k + 1), [])

  useEffect(() => {
    let cancelled = false
    Promise.resolve(dbId)
      .then(id => {
        if (!id) { if (!cancelled) setDetail(null); return }
        if (!cancelled) setLoading(true)
        return fetch(`/api/clinics/${id}`)
          .then(r => r.json())
          .then((d: ClinicDetail) => {
            if (cancelled) return
            // decimal 컬럼 숫자 변환
            setDetail({
              ...d,
              revenueSplitHistory: d.revenueSplitHistory.map(s => ({
                ...s,
                clinicPct:  Number(s.clinicPct),
                hicarePct:  Number(s.hicarePct),
              })),
              billerFeeHistory: d.billerFeeHistory.map(f => ({
                ...f,
                feeValue: Number(f.feeValue),
              })),
            })
          })
          .catch(console.error)
          .finally(() => { if (!cancelled) setLoading(false) })
      })
    return () => { cancelled = true }
  }, [dbId, refreshKey])

  /** EMR 링크 저장 */
  const saveEmrLinks = useCallback(async (emrLinks: EmrLink[]) => {
    if (!dbId) return
    await fetch(`/api/clinics/${dbId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ emrLinks }),
    })
    reload()
  }, [dbId, reload])

  /** 동기화 시각 갱신 */
  const triggerSync = useCallback(async () => {
    if (!dbId) return
    await fetch(`/api/clinics/${dbId}/sync`, { method: 'PATCH' })
    reload()
  }, [dbId, reload])

  return { detail, loading, saveEmrLinks, triggerSync }
}

/** split 이력에서 기간 문자열 생성 (effectiveFrom DESC 순) */
export function splitPeriodLabel(records: SplitRecord[], idx: number): string {
  const from = records[idx].effectiveFrom
  const to   = idx > 0 ? records[idx - 1].effectiveFrom : '현재'
  return `${from} ~ ${to}`
}

/** fee 이력에서 기간 문자열 생성 (effectiveFrom DESC 순) */
export function feePeriodLabel(records: FeeRecord[], idx: number): string {
  const from = records[idx].effectiveFrom
  const to   = idx > 0 ? records[idx - 1].effectiveFrom : '현재'
  return `${from} ~ ${to}`
}
