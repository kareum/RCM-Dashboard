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
├── data/                           # 타입 정의 + 목 데이터 (단일 진실의 원천)
│   └── clinics.ts                  # Clinic 타입, CLINICS 배열, ACTIVE_PATIENTS
│
├── hooks/                          # 데이터 접근 훅 (목 → API 전환 지점)
│   ├── useClinics.ts               # 기본 클리닉 목록/상세
│   └── useBillingClinics.ts        # 청구 전용 클리닉 (split, fee 포함)
│
├── components/
│   ├── ui/                         # 범용 UI 컴포넌트
│   │   ├── Badge.tsx
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── NavTabs.tsx             # 탭 네비게이션
│   │   ├── SegmentedControl.tsx
│   │   ├── Spinner.tsx
│   │   ├── Table.tsx
│   │   ├── Toast.tsx
│   │   ├── Toggle.tsx
│   │   └── Typography.tsx
│   │
│   ├── layout/                     # 앱 레이아웃 컴포넌트
│   │   ├── AppLayout.tsx           # SideNav + TopNav + Outlet
│   │   ├── SideNav.tsx
│   │   ├── TopNav.tsx
│   │   ├── CompanyInfo.tsx         # 회사 정보 모달 (TopNav 내 배치)
│   │   ├── useCompanyInfo.ts       # 회사 정보 훅 (localStorage 저장)
│   │   └── TopNavActionsContext.tsx # TopNav 우측 액션 슬롯 (페이지 → 레이아웃 주입)
│   │
│   └── shared/                     # 여러 페이지에서 공유하는 컴포넌트
│       └── ClinicListItem.tsx       # 클리닉 목록 아이템 (variant: settings | billing)
│
└── pages/
    ├── DashboardPage.tsx
    ├── ClinicSettingsPage.tsx       # 클리닉 설정 (좌: 목록, 우: 상세)
    ├── BillingPage.tsx              # 청구 입력 (좌: 목록, 우: 탭)
    └── billing/                    # BillingPage 전용 서브 컴포넌트
        ├── data.ts                 # BillingClinic 타입 + 청구 목 데이터
        ├── ClinicSidebar.tsx       # 좌측 클리닉 선택 패널
        ├── InvoiceEntryTab.tsx     # 탭 1: Invoice 입력 폼
        └── EntryHistoryTab.tsx     # 탭 2: 입력 내역 테이블
```

---

## 라우터

| 경로 | 페이지 | 설명 |
|---|---|---|
| `/` | DashboardPage | 메인 대시보드 |
| `/clinics` | ClinicSettingsPage | 클리닉 설정 |
| `/billing` | BillingPage | Invoice 입력 · 내역 |

---

## 데이터 레이어 설계

컴포넌트가 데이터를 직접 import하지 않고 **훅을 통해서만** 접근합니다.
API 연동 시 훅 내부만 수정하면 전체 화면에 자동 반영됩니다.

```
[목 데이터]          [훅]                    [컴포넌트]
data/clinics.ts  →  hooks/useClinics.ts  →  ClinicSettingsPage
                                         →  ClinicSidebar (billing)

billing/data.ts  →  hooks/useBillingClinics.ts  →  BillingPage
                                                 →  InvoiceEntryTab
```

### API 전환 시 수정 위치

| 훅 | 현재 | API 전환 후 |
|---|---|---|
| `useClinics` | `CLINICS` 배열 반환 | `GET /api/clinics` |
| `useBillingClinics` | `BILLING_CLINICS` 배열 반환 | `GET /api/clinics` + `GET /api/clinics/:id/billing-settings` 병합 |

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
