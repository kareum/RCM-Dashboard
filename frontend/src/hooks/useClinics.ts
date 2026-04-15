import { CLINICS, ACTIVE_PATIENTS } from '../data/clinics'
import type { Clinic, ServiceType } from '../data/clinics'

// ── useClinics ───────────────────────────────────────────────
// 현재: 목 데이터 반환
// API 전환 시: 이 파일만 수정 (예: useQuery, SWR, fetch 등)
//
// interface UseClinicsResult {
//   clinics:  Clinic[]
//   loading:  boolean
//   error:    Error | null
// }

export function useClinics() {
  // TODO: replace with → fetch('/api/clinics').then(r => r.json())
  return {
    clinics: CLINICS,
    loading: false,
    error:   null,
  }
}

export function useClinic(id: number) {
  // TODO: replace with → fetch(`/api/clinics/${id}`)
  const clinic = CLINICS.find(c => c.id === id) ?? null
  return {
    clinic,
    loading: false,
    error:   null,
  }
}

export function useActivePatients(clinicId: number, service: ServiceType) {
  // TODO: replace with → fetch(`/api/clinics/${clinicId}/patients?service=${service}`)
  return ACTIVE_PATIENTS[clinicId]?.[service] ?? 0
}

export type { Clinic, ServiceType }
