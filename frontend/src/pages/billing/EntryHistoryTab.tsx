import { Card, CardHeader, CardBody, Table, TableHeader, TableRow, TableCell } from '../../components/ui'
import { type BillingClinic, type HistoryEntry, fmt } from './data'

interface EntryHistoryTabProps {
  clinic:  BillingClinic
  entries: HistoryEntry[]
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

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const totalInv    = (entry.rpmInv || 0) + (entry.ccmInv || 0)
  const uncollected = entry.ciTotal != null ? totalInv - entry.ciTotal : totalInv

  return (
    <TableRow>
      <TableCell>{entry.period}</TableCell>
      <TableCell mono>{entry.rpmInv ? fmt(entry.rpmInv) : '—'}</TableCell>
      <TableCell mono>{entry.ccmInv ? fmt(entry.ccmInv) : '—'}</TableCell>
      <TableCell mono>{fmt(totalInv)}</TableCell>
      <TableCell mono>{entry.ciTotal != null ? fmt(entry.ciTotal) : '—'}</TableCell>
      <TableCell mono className={uncollected > 0 ? 'text-[#791F1F]' : ''}>{fmt(uncollected)}</TableCell>
      <TableCell><StatusPill status={entry.status} /></TableCell>
      <TableCell align="right">
        <button className="text-[11px] px-2.5 py-1 border border-[#3B6D11] bg-[#EAF3DE] text-[#27500A] rounded-md cursor-pointer hover:bg-[#d5eabf] transition-colors">
          Edit
        </button>
      </TableCell>
    </TableRow>
  )
}

export function EntryHistoryTab({ clinic, entries }: EntryHistoryTabProps) {
  return (
    <div className="px-6 py-5">
      <Card>
        <CardHeader icon="history" title={`Entry History — ${clinic.name}`} />
        <CardBody padding="none">
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
              {entries.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-10 text-sm text-slate-400">
                    No entries yet for {clinic.name}
                  </td>
                </tr>
              ) : (
                entries.map((e, i) => <HistoryRow key={i} entry={e} />)
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </div>
  )
}
