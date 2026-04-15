import { BILLING_CLINICS } from '../pages/billing/data'
import type { BillingClinic } from '../pages/billing/data'

// ── useBillingClinics ────────────────────────────────────────
// 현재: 목 데이터 반환
// API 전환 시: GET /api/clinics + GET /api/clinics/:id/billing-settings 병합으로 교체

export function useBillingClinics() {
  return {
    clinics: BILLING_CLINICS,
    loading: false,
    error:   null,
  }
}

export function useBillingClinic(id: number) {
  const clinic = BILLING_CLINICS.find(c => c.id === id) ?? BILLING_CLINICS[0]
  return { clinic, loading: false, error: null }
}

export type { BillingClinic }
