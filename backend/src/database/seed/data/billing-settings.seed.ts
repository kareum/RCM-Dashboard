import type { ServiceType } from '../../../clinics/entities/clinic.entity';
import type { FeeType } from '../../../biller-fee/entities/biller-fee-history.entity';

/** 프론트엔드 billing/data.ts 의 BILLING_EXTRA + ClinicSettingsPage SPLIT_HISTORY/FEE_HISTORY 기준 */

export interface RevenueSplitRow {
  clinicCode: string;
  serviceType: ServiceType;
  clinicPct: number;
  hicarePct: number;
  effectiveFrom: string;
}

export interface BillerFeeRow {
  clinicCode: string;
  feeType: FeeType;
  feeValue: number;
  effectiveFrom: string;
  note?: string;
}

/**
 * Revenue Split 이력
 * 각 클리닉의 서비스별 현재 비율 + 과거 이력을 모두 포함
 * 최신(effectiveFrom 큰 것)이 현재 적용값
 */
export const REVENUE_SPLIT_SEED: RevenueSplitRow[] = [
  // SDW — 이력 포함 (ClinicSettingsPage SPLIT_HISTORY 기준)
  {
    clinicCode: 'SDW',
    serviceType: 'RPM',
    clinicPct: 60,
    hicarePct: 40,
    effectiveFrom: '2025-03-01',
  },
  {
    clinicCode: 'SDW',
    serviceType: 'RPM',
    clinicPct: 40,
    hicarePct: 60,
    effectiveFrom: '2025-01-01',
  },
  {
    clinicCode: 'SDW',
    serviceType: 'CCM',
    clinicPct: 60,
    hicarePct: 40,
    effectiveFrom: '2025-03-10',
  },
  {
    clinicCode: 'SDW',
    serviceType: 'CCM',
    clinicPct: 50,
    hicarePct: 50,
    effectiveFrom: '2024-06-01',
  },
  {
    clinicCode: 'SDW',
    serviceType: 'CCM',
    clinicPct: 45,
    hicarePct: 55,
    effectiveFrom: '2024-01-01',
  },

  // WSC
  {
    clinicCode: 'WSC',
    serviceType: 'RPM',
    clinicPct: 50,
    hicarePct: 50,
    effectiveFrom: '2024-01-01',
  },

  // LVM
  {
    clinicCode: 'LVM',
    serviceType: 'CCM',
    clinicPct: 65,
    hicarePct: 35,
    effectiveFrom: '2025-01-01',
  },
  {
    clinicCode: 'LVM',
    serviceType: 'CCM',
    clinicPct: 60,
    hicarePct: 40,
    effectiveFrom: '2024-01-01',
  },

  // PCG
  {
    clinicCode: 'PCG',
    serviceType: 'RPM',
    clinicPct: 55,
    hicarePct: 45,
    effectiveFrom: '2024-06-01',
  },
  {
    clinicCode: 'PCG',
    serviceType: 'RPM',
    clinicPct: 50,
    hicarePct: 50,
    effectiveFrom: '2024-01-01',
  },
  {
    clinicCode: 'PCG',
    serviceType: 'CCM',
    clinicPct: 60,
    hicarePct: 40,
    effectiveFrom: '2024-01-01',
  },

  // NFH
  {
    clinicCode: 'NFH',
    serviceType: 'RPM',
    clinicPct: 50,
    hicarePct: 50,
    effectiveFrom: '2024-01-01',
  },

  // SWC
  {
    clinicCode: 'SWC',
    serviceType: 'RPM',
    clinicPct: 60,
    hicarePct: 40,
    effectiveFrom: '2024-01-01',
  },
  {
    clinicCode: 'SWC',
    serviceType: 'CCM',
    clinicPct: 55,
    hicarePct: 45,
    effectiveFrom: '2024-01-01',
  },

  // GFM
  {
    clinicCode: 'GFM',
    serviceType: 'CCM',
    clinicPct: 50,
    hicarePct: 50,
    effectiveFrom: '2024-01-01',
  },

  // RVH
  {
    clinicCode: 'RVH',
    serviceType: 'RPM',
    clinicPct: 60,
    hicarePct: 40,
    effectiveFrom: '2025-01-01',
  },
  {
    clinicCode: 'RVH',
    serviceType: 'RPM',
    clinicPct: 55,
    hicarePct: 45,
    effectiveFrom: '2024-01-01',
  },
  {
    clinicCode: 'RVH',
    serviceType: 'CCM',
    clinicPct: 60,
    hicarePct: 40,
    effectiveFrom: '2024-01-01',
  },

  // HVC
  {
    clinicCode: 'HVC',
    serviceType: 'RPM',
    clinicPct: 50,
    hicarePct: 50,
    effectiveFrom: '2024-01-01',
  },

  // MMG
  {
    clinicCode: 'MMG',
    serviceType: 'RPM',
    clinicPct: 55,
    hicarePct: 45,
    effectiveFrom: '2024-01-01',
  },
  {
    clinicCode: 'MMG',
    serviceType: 'CCM',
    clinicPct: 55,
    hicarePct: 45,
    effectiveFrom: '2024-01-01',
  },

  // VPC
  {
    clinicCode: 'VPC',
    serviceType: 'CCM',
    clinicPct: 50,
    hicarePct: 50,
    effectiveFrom: '2024-01-01',
  },

  // EHP
  {
    clinicCode: 'EHP',
    serviceType: 'RPM',
    clinicPct: 50,
    hicarePct: 50,
    effectiveFrom: '2024-01-01',
  },
];

/**
 * Biller Fee 이력
 * 현재값 + 과거 이력 포함
 */
export const BILLER_FEE_SEED: BillerFeeRow[] = [
  // SDW — 이력 포함 (ClinicSettingsPage FEE_HISTORY 기준)
  {
    clinicCode: 'SDW',
    feeType: 'pct',
    feeValue: 5.0,
    effectiveFrom: '2025-01-01',
  },
  {
    clinicCode: 'SDW',
    feeType: 'fixed',
    feeValue: 200,
    effectiveFrom: '2024-01-01',
    note: 'Fixed $200/mo',
  },

  // WSC
  {
    clinicCode: 'WSC',
    feeType: 'pct',
    feeValue: 2.0,
    effectiveFrom: '2024-01-01',
  },

  // LVM
  {
    clinicCode: 'LVM',
    feeType: 'fixed',
    feeValue: 150,
    effectiveFrom: '2025-01-01',
  },
  {
    clinicCode: 'LVM',
    feeType: 'fixed',
    feeValue: 120,
    effectiveFrom: '2024-01-01',
  },

  // PCG
  {
    clinicCode: 'PCG',
    feeType: 'pct',
    feeValue: 1.5,
    effectiveFrom: '2024-01-01',
  },

  // NFH
  {
    clinicCode: 'NFH',
    feeType: 'fixed',
    feeValue: 200,
    effectiveFrom: '2024-01-01',
  },

  // SWC
  {
    clinicCode: 'SWC',
    feeType: 'pct',
    feeValue: 1.5,
    effectiveFrom: '2024-01-01',
  },

  // GFM
  {
    clinicCode: 'GFM',
    feeType: 'fixed',
    feeValue: 150,
    effectiveFrom: '2024-01-01',
  },

  // RVH
  {
    clinicCode: 'RVH',
    feeType: 'pct',
    feeValue: 2.0,
    effectiveFrom: '2024-01-01',
  },

  // HVC
  {
    clinicCode: 'HVC',
    feeType: 'pct',
    feeValue: 1.5,
    effectiveFrom: '2024-01-01',
  },

  // MMG
  {
    clinicCode: 'MMG',
    feeType: 'pct',
    feeValue: 1.5,
    effectiveFrom: '2024-06-01',
  },
  {
    clinicCode: 'MMG',
    feeType: 'fixed',
    feeValue: 180,
    effectiveFrom: '2024-01-01',
  },

  // VPC
  {
    clinicCode: 'VPC',
    feeType: 'fixed',
    feeValue: 150,
    effectiveFrom: '2024-01-01',
  },

  // EHP
  {
    clinicCode: 'EHP',
    feeType: 'pct',
    feeValue: 2.0,
    effectiveFrom: '2024-01-01',
  },
];
