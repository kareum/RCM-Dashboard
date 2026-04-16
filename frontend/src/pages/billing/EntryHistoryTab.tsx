import { Card, CardHeader, CardBody, Table, TableHeader, TableRow, TableCell } from '../../components/ui'
import { type BillingClinic, type InvoiceEntryRecord, fmt } from './data'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

interface EntryHistoryTabProps {
  clinic:   BillingClinic
  records:  InvoiceEntryRecord[]
  loading:  boolean
}

function StatusPill({ status }: { status: 'paid' | 'unpaid' }) {
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full ${
      status === 'paid'
        ? 'bg-[#EAF3DE] text-[#27500A]'
        : 'bg-[#FCEBEB] text-[#791F1F]'
    }`}>
      {status === 'paid' ? 'Paid' : 'Unpaid'}
    </span>
  )
}

function HistoryRow({ record }: { record: InvoiceEntryRecord }) {
  const rpmInv      = record.rpmInvoice ?? 0
  const ccmInv      = record.ccmInvoice ?? 0
  const totalInv    = rpmInv + ccmInv
  const uncollected = record.ciAmount != null ? totalInv - record.ciAmount : totalInv
  const period      = `${MONTHS[record.billingMonth - 1]} ${record.billingYear}`

  return (
    <TableRow>
      <TableCell>{period}</TableCell>
      <TableCell mono>{rpmInv > 0 ? fmt(rpmInv) : '—'}</TableCell>
      <TableCell mono>{ccmInv > 0 ? fmt(ccmInv) : '—'}</TableCell>
      <TableCell mono>{fmt(totalInv)}</TableCell>
      <TableCell mono>{record.ciAmount != null ? fmt(record.ciAmount) : '—'}</TableCell>
      <TableCell mono className={uncollected > 0 ? 'text-[#791F1F]' : ''}>{fmt(uncollected)}</TableCell>
      <TableCell><StatusPill status={record.status} /></TableCell>
      <TableCell align="right">
        <button className="text-[11px] px-2.5 py-1 border border-[#3B6D11] bg-[#EAF3DE] text-[#27500A] rounded-md cursor-pointer hover:bg-[#d5eabf] transition-colors">
          Edit
        </button>
      </TableCell>
    </TableRow>
  )
}

export function EntryHistoryTab({ clinic, records, loading }: EntryHistoryTabProps) {
  return (
    <div className="px-6 py-5">
      <Card>
        <CardHeader icon="history" title={`Entry History — ${clinic.name}`} />
        <CardBody padding="none">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-sm text-slate-400 gap-2">
              <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
              Loading…
            </div>
          ) : (
            <Table>
              <TableHeader
                columns={[
                  { label:'Period' },
                  { label:'RPM invoice' },
                  { label:'CCM invoice' },
                  { label:'Total invoice' },
                  { label:'HicareNet CI' },
                  { label:'Uncollected' },
                  { label:'Status' },
                  { label:'Action', align:'right' },
                ]}
              />
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-10 text-sm text-slate-400">
                      No entries yet for {clinic.name}
                    </td>
                  </tr>
                ) : (
                  records.map(r => <HistoryRow key={r.id} record={r} />)
                )}
              </tbody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
