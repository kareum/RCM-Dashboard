import { useState, useEffect } from 'react'
import { CLINICS, ACTIVE_PATIENTS } from '../data/clinics'
import type { Clinic, ServiceType } from '../data/clinics'

interface ApiClinic { id: string; code: string }

// ── useClinics ───────────────────────────────────────────────
// GET /api/clinics 로 DB UUID(dbId)를 가져와 목 데이터와 병합

export function useClinics() {
  const [clinics, setClinics] = useState<Clinic[]>(CLINICS)

  useEffect(() => {
    fetch('/api/clinics')
      .then(r => r.json())
      .then((apiClinics: ApiClinic[]) => {
        setClinics(prev =>
          prev.map(c => {
            const match = apiClinics.find(a => a.code === c.code)
            return match ? { ...c, dbId: match.id } : c
          }),
        )
      })
      .catch(console.error)
  }, [])

  return { clinics, loading: false, error: null }
}

export function useClinic(id: number) {
  const { clinics } = useClinics()
  const clinic = clinics.find(c => c.id === id) ?? null
  return { clinic, loading: false, error: null }
}

export function useActivePatients(clinicId: number, service: ServiceType) {
  return ACTIVE_PATIENTS[clinicId]?.[service] ?? 0
}

export type { Clinic, ServiceType }
