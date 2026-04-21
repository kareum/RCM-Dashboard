# HCN RCM — Frontend

React + TypeScript + Vite 기반 RCM(Revenue Cycle Management) 프론트엔드.

---

## 기술 스택

| 항목 | 버전 |
|---|---|
| React | 19 |
| TypeScript | 5.7 |
| Vite | 8 |
| Tailwind CSS | 4.2 |
| React Router | 7 |

---

## 시작하기

```bash
cd frontend
npm install
npm run dev      # 개발 서버 (http://localhost:3000)
npm run build    # 프로덕션 빌드
npm run lint     # ESLint 검사
```

---

## 프로젝트 구조

```
src/
├── main.tsx                        # 진입점
├── App.tsx                         # 라우터 설정
├── index.css                       # Tailwind + 디자인 토큰 (@theme)
│
├── lib/                            # 순수 함수 (side-effect 없음)
│   └── billingCalcs.ts             # 청구 금액 계산 (calcBilling, offsetMonth)
│
├── data/                           # 타입 정의 + 목 데이터 (단일 진실의 원천)
│   └── clinics.ts                  # Clinic 타입, CLINICS 배열, ACTIVE_PATIENTS
│
├── hooks/                          # 비즈니스 로직 전담 — 인터페이스를 export
│   ├── useClinics.ts               # 기본 클리닉 목록/상세
│   ├── useBillingClinics.ts        # 청구 전용 클리닉 (split, fee 포함)
│   ├── useBillingSettings.ts       # 클리닉별 split/fee DB 조회
│   ├── useInvoiceEntries.ts        # Invoice 레코드 CRUD
│   ├── useClinicSettings.ts        # 클리닉 상세 + 이력 조회, EMR 저장, sync
│   │
│   │   ── 페이지 단위 상태 훅 (UI 컴포넌트는 이 인터페이스에만 의존) ──
│   ├── useInvoiceForm.ts           # → InvoiceFormState
│   ├── useCIForm.ts                # → CIFormState
│   ├── useBillingPage.ts           # → BillingPageState
│   └── useClinicSettingsPage.ts    # → ClinicSettingsPageState
│
├── components/
│   ├── ui/                         # 범용 UI 원시 컴포넌트 (스타일만, 로직 없음)
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── NavTabs.tsx
│   │   ├── SegmentedControl.tsx
│   │   ├── Spinner.tsx
│   │   ├── Table.tsx
│   │   ├── Toast.tsx
│   │   ├── Toggle.tsx
│   │   └── Typography.tsx
│   │
│   ├── billing/                    # 청구 도메인 UI 컴포넌트 (스타일만, 로직 없음)
│   │   ├── MoneyInput.tsx          # $ 접두사 금액 입력
│   │   ├── SelectInput.tsx         # 레이블 포함 select
│   │   ├── CalcBox.tsx             # 계산 결과 표시 박스
│   │   ├── TotalCard.tsx           # 합계 카드
│   │   ├── ServiceBlock.tsx        # RPM/CCM 서비스 입력 블록
│   │   └── CISection.tsx           # 입금 정보 입력 섹션 (useCIForm 소비)
│   │
│   ├── layout/                     # 앱 레이아웃 컴포넌트
│   │   ├── AppLayout.tsx           # SideNav + TopNav + Outlet
│   │   ├── SideNav.tsx
│   │   ├── TopNav.tsx
│   │   ├── CompanyInfo.tsx
│   │   ├── useCompanyInfo.ts
│   │   └── TopNavActionsContext.tsx
│   │
│   └── shared/                     # 도메인 공유 컴포넌트
│       └── ClinicListItem.tsx
│
└── pages/                          # Thin view layer — 훅 인터페이스에만 의존
    ├── DashboardPage.tsx
    ├── ClinicSettingsPage.tsx       # useClinicSettingsPage 소비
    ├── BillingPage.tsx              # useBillingPage 소비
    └── billing/
        ├── data.ts                 # BillingClinic 타입 + 청구 목 데이터
        ├── InvoiceEntryTab.tsx     # useInvoiceForm + calcBilling 소비
        └── EntryHistoryTab.tsx
```

---

## 라우터

| 경로 | 페이지 | 설명 |
|---|---|---|
| `/` | DashboardPage | 메인 대시보드 |
| `/clinics` | ClinicSettingsPage | 클리닉 설정 |
| `/billing` | BillingPage | Invoice 입력 · 내역 |

---

## 아키텍처: 비즈니스 로직 / 뷰 분리

UI 컴포넌트는 **훅이 반환하는 인터페이스에만 의존**합니다.
데이터 흐름이 어디서 왔는지(목 데이터, API, 로컬 상태)를 알지 못합니다.

```
┌─────────────────────┐     인터페이스     ┌──────────────────────┐
│   Business Logic    │  ─────────────→  │       View           │
│                     │                  │                      │
│  lib/billingCalcs   │  BillingCalcs    │  components/billing/ │
│  hooks/useInvoice   │  InvoiceForm     │  pages/billing/      │
│  Form               │  State           │  InvoiceEntryTab     │
│                     │                  │                      │
│  hooks/useCIForm    │  CIFormState  →  │  CISection           │
│  hooks/useBilling   │  BillingPage  →  │  BillingPage         │
│  Page               │  State           │                      │
│  hooks/useClinic    │  ClinicSettings  │  ClinicSettings      │
│  SettingsPage       │  PageState    →  │  Page                │
└─────────────────────┘                  └──────────────────────┘
```

### 각 계층의 역할

| 계층 | 위치 | 규칙 |
|---|---|---|
| **순수 함수** | `lib/` | 인자 → 결과만. React import 없음 |
| **데이터 훅** | `hooks/use*Entries`, `use*Settings` 등 | API 호출, 상태 관리. 반환 타입 명시 |
| **페이지 훅** | `hooks/useBillingPage`, `useClinicSettingsPage` 등 | 페이지 단위 상태 조합. 인터페이스(`*State`) export |
| **UI 컴포넌트** | `components/ui/`, `components/billing/` | JSX + 스타일만. 비즈니스 로직 없음 |
| **페이지** | `pages/` | 훅 호출 + UI 조합. 로직 없음 |

### 페이지 훅 인터페이스

각 페이지 훅은 반환 타입을 명시적으로 export합니다.
UI 컴포넌트는 이 타입만 import하면 됩니다.

```ts
// hooks/useInvoiceForm.ts
export interface InvoiceFormState {
  year: number; month: number; monthLabel: string
  rpmInvoice: string; ccmInvoice: string
  handleRpmInvoice: (v: string) => void
  autoSaveState: 'idle' | 'saving' | 'saved'
  currentEntry: InvoiceEntryRecord | null
  // ...
}

// pages/billing/InvoiceEntryTab.tsx — 로직 없이 인터페이스만 소비
export function InvoiceEntryTab({ clinic, records, onSaveInvoice, onSaveCi }) {
  const form  = useInvoiceForm(clinic, records, onSaveInvoice)  // InvoiceFormState
  const calcs = calcBilling(clinic, form.rpmInvoice, form.ccmInvoice)  // BillingCalcs
  return ( /* JSX only */ )
}
```

### API 전환 시 수정 위치

컴포넌트는 건드리지 않고 **훅 내부만** 수정합니다.

| 훅 | 현재 | API 전환 후 |
|---|---|---|
| `useClinics` | `CLINICS` 배열 반환 | `GET /api/clinics` |
| `useBillingClinics` | `BILLING_CLINICS` 배열 반환 | `GET /api/clinics` + billing-settings 병합 |
| `useInvoiceEntries` | API 연동 완료 | — |
| `useBillingSettings` | API 연동 완료 | — |
| `useClinicSettings` | API 연동 완료 | — |

---

## 공유 컴포넌트 규칙

### ClinicListItem — `variant` prop으로 페이지별 스타일 분기

```tsx
// ClinicSettingsPage — drag handle, active/inactive 상태 표시
<ClinicListItem clinic={c} isActive={...} onClick={...} variant="settings" />

// BillingPage — 단순 선택 스타일
<ClinicListItem clinic={c} isActive={...} onClick={...} variant="billing" />
```

### TopNavActionsContext — 페이지가 TopNav 우측 액션을 주입

```tsx
// 페이지 컴포넌트 내에서
const { setActions } = useTopNavActions()

useEffect(() => {
  setActions(<SyncButton />)
  return () => setActions(null)
}, [])
```

---

## 디자인 시스템

- **Tailwind CSS v4** — `@theme {}` 블록으로 커스텀 토큰 정의 (`src/index.css`)
- **Material Symbols Outlined** — 아이콘 폰트 (텍스트 기반)
- **커스텀 컴포넌트** — MUI 미사용, `src/components/ui/` 직접 구현

### 주요 색상 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| `primary` | `#005dac` | 주요 액션, 활성 상태 |
| `tertiary` | `#006c1b` | 성공, 활성 환자 |
| `error` | `#ba1a1a` | 오류, 경고 |
| `surface` | `#fcf9f8` | 배경 |
| `on-surface` | `#1b1c1c` | 본문 텍스트 |

### 서비스 타입 컬러

| 서비스 | 배경 | 텍스트 |
|---|---|---|
| RPM | `#E6F1FB` | `#0C447C` |
| CCM | `#E1F5EE` | `#085041` |
