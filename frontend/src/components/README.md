# Components

디자인 토큰 기반 공통 컴포넌트 모음.  
토큰 값 변경은 항상 [`doc/design/design-tokens.md`](../../../doc/design/design-tokens.md) → [`src/index.css`](../index.css) 순서로 반영한다.

---

## 아이콘 사용법 (Material Symbols)

이 프로젝트는 Google의 **Material Symbols Outlined** 폰트를 사용한다.  
아이콘 파일을 따로 추가할 필요 없이, **아이콘 이름 텍스트**를 클래스와 함께 쓰면 폰트가 자동으로 아이콘으로 렌더링한다.

```tsx
// 기본 아이콘
<span className="material-symbols-outlined">sync</span>

// 채워진(Filled) 아이콘
<span className="material-symbols-outlined icon-filled">local_hospital</span>

// 크기 조정 (Tailwind text- 클래스)
<span className="material-symbols-outlined text-sm">close</span>
<span className="material-symbols-outlined text-2xl">monitoring</span>
```

**동작 원리**

```
폰트 파일(woff2) 로드  →  font-family 지정  →  "sync" 텍스트  →  🔄 아이콘 렌더링
```

`font-family: 'Material Symbols Outlined'` 가 없으면 텍스트 그대로 표시된다.  
→ `src/index.css`의 `.material-symbols-outlined` 클래스에 선언되어 있음.

**아이콘 이름 검색:** https://fonts.google.com/icons  
원하는 아이콘을 검색 → 이름 클릭 → 우측 패널에서 아이콘명 확인

---

## 전체 화면 구조

```
브라우저 (index.html 하나)
└── App.tsx
    └── BrowserRouter
        └── Routes
            └── AppLayout          ← SideNav + TopNav 항상 고정
                ├── /              → DashboardPage    ┐
                ├── /clinics       → ClinicSettingsPage├ <Outlet /> 자리만 교체
                └── /billing       → BillingPage      ┘
```

SideNav · TopNav는 한 번만 렌더링.  
메뉴 클릭 시 `<Outlet />` 안의 페이지 컴포넌트만 교체된다.

---

## 시안 조정 포인트

컴포넌트 색상·크기를 props 한 줄로 바꿀 수 있다.

```tsx
// 카드 헤더 타이틀 색상 변경
<CardHeader title="Basic Information" titleColor="primary" />

// 카드 헤더 배경 변경
<CardHeader title="EMR Access" headerBg="bg-blue-50/40" />

// 섹션 레이블 크기 변경
<SectionLabel size="sm" color="muted">Revenue Split</SectionLabel>

// 필드 값 크기 조정
<FieldValue size="lg">60/40</FieldValue>
```

조정 가능한 props는 `Typography.tsx`의 `textColors` 객체에서 한꺼번에 관리.

---

## 폴더 구조

```
components/
├── ui/          Atoms — 가장 작은 재사용 단위. 도메인을 모름
│   ├── Button
│   ├── Badge
│   ├── Card        CardHeader(titleColor, headerBg, iconColor) + CardBody(padding)
│   ├── Input
│   ├── Toggle
│   ├── Spinner
│   ├── Toast
│   ├── Modal
│   ├── Table
│   ├── SegmentedControl
│   └── Typography      PageTitle · SectionLabel · FieldLabel · FieldValue · HintText
│
└── layout/      Organisms — 전체 페이지 공통 레이아웃
    ├── AppLayout   SideNav + TopNav + <Outlet /> 구조
    ├── SideNav
    └── TopNav
```

> 도메인 전용 컴포넌트(예: `ClinicListItem`, `RevenueSplitTable`)는  
> `components/clinic/`, `components/billing/` 에 추가한다.

---

## ui/

### Button

```tsx
import { Button } from '@/components/ui'

// 텍스트만
<Button variant="primary">Save</Button>

// 아이콘 + 텍스트
<Button variant="primary" leftIcon={<span className="material-symbols-outlined text-base">sync</span>}>
  Sync now
</Button>

// 아이콘만 (정사각형)
<Button variant="ghost" size="sm" iconOnly>
  <span className="material-symbols-outlined text-base">close</span>
</Button>
```

| Prop | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `variant` | `primary \| secondary \| ghost \| danger` | `primary` | 색상 스타일 |
| `size` | `sm \| md \| lg` | `md` | 크기 |
| `leftIcon` | `ReactNode` | — | 좌측 아이콘 |
| `rightIcon` | `ReactNode` | — | 우측 아이콘 |
| `iconOnly` | `boolean` | `false` | 텍스트 숨기고 정사각형으로 |

---

### Badge

```tsx
import { Badge } from '@/components/ui'

<Badge variant="active" dot>Active Provider</Badge>
<Badge variant="denied">Denied</Badge>
<Badge variant="rpm">RPM</Badge>
```

| variant | 배경 | 텍스트 | 사용처 |
|---|---|---|---|
| `active` / `paid` | tertiary-fixed | tertiary-container | 활성, 수금 완료 |
| `inactive` | surface-container-high | on-surface-variant | 비활성 |
| `denied` | error-container | on-error-container | 거절, 오류 |
| `pending` | secondary-fixed | on-secondary-fixed-variant | 대기, 부분 수금 |
| `rpm` | #E6F1FB | #0C447C | RPM 서비스 |
| `ccm` | #E1F5EE | #085041 | CCM 서비스 |

---

### Card

```tsx
import { Card, CardHeader, CardBody } from '@/components/ui'

<Card>
  <CardHeader
    icon="info"
    title="Basic Information"
    badge={
      <span className="text-[10px] text-on-surface-variant bg-surface-container px-2 py-0.5 rounded-full flex items-center gap-1">
        <span className="material-symbols-outlined text-[12px]">lock</span>
        Read-only · synced
      </span>
    }
  />
  <CardBody>
    ...
  </CardBody>
</Card>
```

| Prop (CardHeader) | 타입 | 설명 |
|---|---|---|
| `icon` | `string` | Material Symbols 아이콘명 |
| `title` | `string` | 섹션 제목 (자동 대문자) |
| `badge` | `ReactNode` | 우측 레이블 (Read-only, Editable 등) |

---

### TextInput

```tsx
import { TextInput } from '@/components/ui'

// 일반 입력
<TextInput label="Clinic Name" placeholder="Enter name" />

// 읽기 전용 (원서버 동기화 데이터)
<TextInput variant="readonly" label="Federal Tax ID" value="12-3456789" mono />

// 검색 (좌측 아이콘)
<TextInput
  variant="search"
  leftIcon={<span className="material-symbols-outlined text-sm">search</span>}
  placeholder="Search by name or code..."
/>
```

| `variant` | 설명 |
|---|---|
| `default` | 흰 배경, 포커스 시 파란 테두리 |
| `readonly` | surface-container-low 배경, 수정 불가 |
| `search` | 좌측 아이콘 슬롯 포함 |

---

### Toggle

```tsx
import { Toggle } from '@/components/ui'

const [checked, setChecked] = useState(true)

<Toggle
  checked={checked}
  onChange={setChecked}
  label="Accept Assignment"
  hint="Medicare 청구 시 Yes 권장"
/>
```

---

### Spinner

```tsx
import { Spinner } from '@/components/ui'

<Spinner size="sm" />
<Spinner size="md" label="Syncing..." />
```

Sync 버튼 로딩 상태, 페이지 로딩 등에 사용.

---

### Toast

```tsx
import { Toast } from '@/components/ui'

const [toast, setToast] = useState({ visible: false, message: '', variant: 'success' })

<Toast
  visible={toast.visible}
  message={toast.message}
  variant={toast.variant}
  onClose={() => setToast(t => ({ ...t, visible: false }))}
/>

// 표시
setToast({ visible: true, message: 'EMR links saved', variant: 'success' })
```

| `variant` | 아이콘 | 사용처 |
|---|---|---|
| `success` | check_circle (초록) | 저장, 동기화 완료 |
| `error` | error (빨강) | 실패, 유효성 오류 |
| `info` | info (파랑) | 일반 안내 |

---

### Modal

```tsx
import { Modal } from '@/components/ui'
import { Button } from '@/components/ui'

const [open, setOpen] = useState(false)

<Modal
  open={open}
  onClose={() => setOpen(false)}
  title="RPM Split History"
  subtitle="원서버 기준 변경 이력 (소급 적용 없음)"
  footer={<Button variant="ghost" onClick={() => setOpen(false)}>Close</Button>}
>
  {/* 모달 내용 */}
</Modal>
```

| `size` | 너비 |
|---|---|
| `sm` | max-w-sm (384px) |
| `md` | max-w-lg (512px) — 기본값 |
| `lg` | max-w-2xl (672px) |

---

### Table

```tsx
import { Table, TableHeader, TableRow, TableCell } from '@/components/ui'

<Table>
  <TableHeader
    columns={[
      { label: 'Service', width: 'w-24' },
      { label: 'Split' },
      { label: 'Effective From' },
      { label: '', width: 'w-24' },
    ]}
  />
  <tbody>
    <TableRow>
      <TableCell><Badge variant="rpm">RPM</Badge></TableCell>
      <TableCell>Clinic 60% / Hicare 40%</TableCell>
      <TableCell mono muted>2025-03</TableCell>
      <TableCell align="right">
        <Button variant="ghost" size="sm">View history</Button>
      </TableCell>
    </TableRow>
  </tbody>
</Table>
```

---

### SegmentedControl

```tsx
import { SegmentedControl } from '@/components/ui'

type FilterMode = 'all' | 'active' | 'inactive'

const [filter, setFilter] = useState<FilterMode>('all')

<SegmentedControl
  options={[
    { label: 'All',      value: 'all',      count: 22 },
    { label: 'Active',   value: 'active',   count: 19 },
    { label: 'Inactive', value: 'inactive', count: 3  },
  ]}
  value={filter}
  onChange={setFilter}
/>
```

---

## layout/

### SideNav

```tsx
import { SideNav } from '@/components/layout'

<SideNav userName="Areum Kim" userRole="Administrator" userInitials="AR" />
```

메뉴 항목은 `SideNav.tsx` 내부 `NAV_ITEMS` 배열에서 관리.  
`react-router-dom`의 `NavLink` 기반으로 현재 라우트에 따라 active 상태 자동 결정.

| State | 배경 | 텍스트 | 아이콘 | 우측 Accent |
|---|---|---|---|---|
| Selected | blue-600/20 | white | text-blue-400 + FILL 1 | border-r-4 border-blue-500 |
| Default | transparent | slate-400 | currentColor + FILL 0 | 없음 |
| Hover | slate-800/50 | white | — | 없음 |

---

### TopNav

```tsx
import { TopNav } from '@/components/layout'

<TopNav
  title="Clinic Settings"
  tabs={[
    { label: 'Clinic Master', to: '/clinics' },
    { label: 'Bulk Updates',  to: '/clinics/bulk' },
  ]}
/>
```

---

---

### Typography

시안 조정의 핵심. 색상·크기를 한 곳(`textColors`)에서 관리한다.

```tsx
import { PageTitle, SectionLabel, FieldLabel, FieldValue, HintText } from '@/components/ui'

<PageTitle color="default">Clinic Settings</PageTitle>
<SectionLabel size="xs" color="default">Basic Information</SectionLabel>
<FieldLabel sub="Box 25">Federal Tax ID (EIN)</FieldLabel>
<FieldValue mono>12-3456789</FieldValue>
<FieldValue size="lg">60/40</FieldValue>
<HintText>RPM/CCM은 보통 11 또는 02</HintText>
```

**`textColors` 팔레트 — `Typography.tsx`에서 수정하면 전체 반영**

| key | 색상 | 용도 |
|---|---|---|
| `default` | #1b1c1c | 본문, 제목 기본값 |
| `muted` | #414752 | 보조 텍스트, 레이블 |
| `primary` | #005dac | 강조 제목 |
| `inverse` | #ffffff | 다크 배경 위 |
| `error` | #93000a | 오류 |
| `success` | #278631 | 성공 |

---

## 컴포넌트 추가 원칙

1. **`ui/`** — 도메인 용어 금지. `ClinicBadge` ❌ → `Badge` ✅
2. **시각 조정은 props로** — 색상·크기를 하드코딩하지 않는다
3. **`index.ts` barrel** — 새 컴포넌트 추가 시 반드시 export 등록
4. **이 README 업데이트** — 컴포넌트 추가/변경 시 함께 수정
