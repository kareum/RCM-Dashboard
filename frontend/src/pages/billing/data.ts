import { CLINICS } from '../../data/clinics'
import type { Clinic } from '../../data/clinics'

export type { ServiceType } from '../../data/clinics'
export type FeeType     = 'pct' | 'fixed'
export type EntryStatus = 'paid' | 'unpaid'

/** 공유 Clinic에 청구 전용 필드를 추가 */
export interface BillingClinic extends Clinic {
  rpmSplit:      [number, number]   // [clinic%, hicare%]
  ccmSplit:      [number, number]
  billerFeeType: FeeType
  billerFeeVal:  number
}

export interface HistoryEntry {
  period:  string
  rpmInv:  number
  ccmInv:  number
  ciTotal: number | null
  status:  EntryStatus
}

/** DB에서 내려오는 invoice_entries 레코드 형태 */
export interface InvoiceEntryRecord {
  id:           string
  clinicId:     string
  billingYear:  number
  billingMonth: number
  rpmInvoice:   number | null
  ccmInvoice:   number | null
  rpmPts:       number | null
  ccmPts:       number | null
  ciAmount:     number | null
  ciDate:       string | null
  ciMethod:     'ACH' | 'Zelle' | 'Check' | null
  ciReference:  string | null
  ciRemark:     string | null
  status:       EntryStatus
}

/** CLINICS(공유 기본 데이터)에 청구 전용 필드를 병합
 *  API 연동 시: GET /api/clinics/:id/billing-settings 응답으로 교체 */
const BILLING_EXTRA: Record<number, Omit<BillingClinic, keyof Clinic>> = {
  1:  { rpmSplit:[60,40], ccmSplit:[60,40], billerFeeType:'pct',   billerFeeVal:1.5 },
  2:  { rpmSplit:[50,50], ccmSplit:[50,50], billerFeeType:'pct',   billerFeeVal:2   },
  3:  { rpmSplit:[70,30], ccmSplit:[65,35], billerFeeType:'fixed', billerFeeVal:150 },
  4:  { rpmSplit:[55,45], ccmSplit:[60,40], billerFeeType:'pct',   billerFeeVal:1.5 },
  5:  { rpmSplit:[50,50], ccmSplit:[50,50], billerFeeType:'fixed', billerFeeVal:200 },
  6:  { rpmSplit:[60,40], ccmSplit:[55,45], billerFeeType:'pct',   billerFeeVal:1.5 },
  7:  { rpmSplit:[50,50], ccmSplit:[50,50], billerFeeType:'fixed', billerFeeVal:150 },
  8:  { rpmSplit:[60,40], ccmSplit:[60,40], billerFeeType:'pct',   billerFeeVal:2   },
  9:  { rpmSplit:[50,50], ccmSplit:[50,50], billerFeeType:'pct',   billerFeeVal:1.5 },
  10: { rpmSplit:[55,45], ccmSplit:[55,45], billerFeeType:'pct',   billerFeeVal:1.5 },
  11: { rpmSplit:[50,50], ccmSplit:[50,50], billerFeeType:'fixed', billerFeeVal:150 },
  12: { rpmSplit:[50,50], ccmSplit:[50,50], billerFeeType:'pct',   billerFeeVal:2   },
}

const DEFAULT_EXTRA: Omit<BillingClinic, keyof Clinic> = {
  rpmSplit:[50,50], ccmSplit:[50,50], billerFeeType:'pct', billerFeeVal:1.5,
}

export const BILLING_CLINICS: BillingClinic[] = CLINICS.map(c => ({
  ...c,
  ...(BILLING_EXTRA[c.id] ?? DEFAULT_EXTRA),
}))

export const BILLING_HISTORY: Record<string, HistoryEntry[]> = {
  SDW: [
    { period:'Mar 2025', rpmInv:18450, ccmInv:19097, ciTotal:33000, status:'paid'   },
    { period:'Feb 2025', rpmInv:17200, ccmInv:18100, ciTotal:31800, status:'paid'   },
    { period:'Jan 2025', rpmInv:16800, ccmInv:17900, ciTotal:null,  status:'unpaid' },
  ],
  LVM: [
    { period:'Feb 2025', rpmInv:0,     ccmInv:12400, ciTotal:11200, status:'paid'   },
  ],
  PCG: [
    { period:'Feb 2025', rpmInv:22000, ccmInv:19500, ciTotal:38000, status:'paid'   },
    { period:'Jan 2025', rpmInv:21500, ccmInv:18900, ciTotal:35000, status:'paid'   },
  ],
}

export const fmt = (n: number) =>
  '$' + Math.round(n).toLocaleString('en-US')
