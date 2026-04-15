import { useState, useMemo } from 'react'
import { TextInput, SegmentedControl } from '../ui'
import { ClinicListItem } from './ClinicListItem'
import { useClinics }     from '../../hooks/useClinics'

type FilterMode = 'all' | 'active' | 'inactive'

interface ClinicListPanelProps {
  activeId: number
  onSelect: (id: number) => void
}

export function ClinicListPanel({ activeId, onSelect }: ClinicListPanelProps) {
  const { clinics } = useClinics()
  const [filter, setFilter] = useState<FilterMode>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => clinics.filter(c => {
    const q = search.toLowerCase()
    const matchSearch = c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    const matchFilter =
      filter === 'all'      ? true :
      filter === 'active'   ? c.active :
      /* inactive */          !c.active
    return matchSearch && matchFilter
  }), [clinics, filter, search])

  return (
    <aside className="w-72 bg-surface-container-low flex flex-col flex-shrink-0 border-r border-outline-variant/10 h-full">

      {/* 상태 필터 탭 */}
      <div className="px-4 pt-4">
        <SegmentedControl<FilterMode>
          options={[
            { label:'All',      value:'all',      count: clinics.length },
            { label:'Active',   value:'active',   count: clinics.filter(c => c.active).length },
            { label:'Inactive', value:'inactive', count: clinics.filter(c => !c.active).length },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>

      {/* 검색 */}
      <div className="px-4 py-3">
        <TextInput
          variant="search"
          leftIcon={<span className="material-symbols-outlined text-sm">search</span>}
          placeholder="Search by name or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <p className="text-[10px] text-on-surface-variant mt-2">
          {filtered.length} clinic{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* 클리닉 목록 */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-xs text-slate-400 text-center py-8 px-4">No clinics found</p>
        )}
        {filtered.map(c => (
          <ClinicListItem
            key={c.id}
            clinic={c}
            isActive={c.id === activeId}
            onClick={() => onSelect(c.id)}
          />
        ))}
      </div>
    </aside>
  )
}
