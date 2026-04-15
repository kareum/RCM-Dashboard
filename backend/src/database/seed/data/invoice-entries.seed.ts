/** 프론트엔드 billing/data.ts 의 BILLING_HISTORY 기준 */

const MONTH_MAP: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};

function parsePeriod(period: string): { year: number; month: number } {
  const [mon, yr] = period.split(' ');
  return { year: parseInt(yr), month: MONTH_MAP[mon] };
}

export interface InvoiceEntrySeed {
  clinicCode: string;
  billingYear: number;
  billingMonth: number;
  rpmInvoice: number | null;
  ccmInvoice: number | null;
  ciAmount: number | null;
  status: 'paid' | 'unpaid';
}

const RAW = [
  {
    code: 'SDW',
    period: 'Mar 2025',
    rpmInv: 18450,
    ccmInv: 19097,
    ciTotal: 33000,
    status: 'paid' as const,
  },
  {
    code: 'SDW',
    period: 'Feb 2025',
    rpmInv: 17200,
    ccmInv: 18100,
    ciTotal: 31800,
    status: 'paid' as const,
  },
  {
    code: 'SDW',
    period: 'Jan 2025',
    rpmInv: 16800,
    ccmInv: 17900,
    ciTotal: null,
    status: 'unpaid' as const,
  },
  {
    code: 'LVM',
    period: 'Feb 2025',
    rpmInv: 0,
    ccmInv: 12400,
    ciTotal: 11200,
    status: 'paid' as const,
  },
  {
    code: 'PCG',
    period: 'Feb 2025',
    rpmInv: 22000,
    ccmInv: 19500,
    ciTotal: 38000,
    status: 'paid' as const,
  },
  {
    code: 'PCG',
    period: 'Jan 2025',
    rpmInv: 21500,
    ccmInv: 18900,
    ciTotal: 35000,
    status: 'paid' as const,
  },
];

export const INVOICE_ENTRIES_SEED: InvoiceEntrySeed[] = RAW.map((r) => {
  const { year, month } = parsePeriod(r.period);
  return {
    clinicCode: r.code,
    billingYear: year,
    billingMonth: month,
    rpmInvoice: r.rpmInv || null,
    ccmInvoice: r.ccmInv || null,
    ciAmount: r.ciTotal,
    status: r.status,
  };
});
