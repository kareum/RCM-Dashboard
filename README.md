# RCM Dashboard — Project Docs

ERA 매칭 → Invoice 발행 → 수금 정산까지  
전체 Revenue Cycle Management 프로세스를 관리하는 내부 대시보드입니다.

---

## Repo 구성

| Repo | 역할 | 담당 |
|---|---|---|
| `docs` | 설계 문서, DB 스키마, API 명세 공유 | 공동 관리 |
| `rcm-server` | 백엔드 API 서버 + DB + Sync 배치| Backend 개발자 |
| `rcm-dashboard` | 프론트엔드 대시보드 (React/Next.js) | Frontend 개발자 |

> 설계 문서는 항상 이 repo(`docs`)를 단일 정본으로 사용합니다.

---

## 시스템 구조

```
외부 사이트 (원서버)
      │
      │  Full sync — 수동 Sync now
      │  JWT 인증, 클리닉·billing 데이터 수신
      ▼
 rcm-server
  ├── 내부 DB (PostgreSQL)
  │    ├── 외부 API 원본 (raw)
  │    ├── 내부 마스터 (clinics, patients)
  │    ├── Billing 핵심 (invoices, payments)
  │    └── 이력 관리 (history 테이블)
  ├── REST API (rcm-dashboard에서 호출)
  └── Sync 배치 (cron + 수동 트리거)
      │
      │  Internal API
      ▼
  rcm-dashboard
   ├── Story Billing — ERA, Denial, AR Aging 관리
   ├── Story Invoice — Invoice 발행, 수금, 정산 관리
   └── Story Clinic Settings — 클리닉 설정 및 데이터 동기화
```

---

## 핵심 업무 흐름

### 정산 플로우 (정상)

```
Billing data 생성
  → EOB 입력 (PDF 파싱 + Medicare ID 매칭)
  → Invoice 생성 (Revenue split 적용)
  → 수금 대기 (클리닉 입금)
  → 정산 완료
```

### EOB 재발행 시나리오

```
정산완료 → EOB 재발행 수신
  → 기존 Invoice Void
  → Invoice 재생성
  → 재정산 완료
```

---

## 데이터 동기화 전략

- **방식**: Full sync (전체 비교)
- **수동 트리거**: 설정 화면 → Sync now 버튼
- **대상**: clinics · billing raw data
- **처리 규칙**:
  - 신규 `external_id` → INSERT
  - hash 불일치 → UPDATE
  - 원서버에서 사라짐 → `is_active = false` (삭제 X)
  - 환자 클리닉 이동 감지 → `patient_clinic_assignments` 이력 트랜잭션 처리

---

## DB 설계 요약

| 그룹 | 테이블 | 설명 |
|---|---|---|
| A. 외부 API 원본 | `api_sync_log`, `patients_raw`, `billing_raw` | 원서버 raw 데이터 보관 |
| B. 내부 마스터 | `clinics`, `patients`, `patient_clinic_assignments`, `sync_settings` | 변환된 정규화 데이터 |
| C. 핵심 업무 | `eob_files`, `era_matches`, `invoices`, `payments` | ERA → Invoice → 수금 → 정산 |
| D. 이력 관리 | `invoice_history`, `revenue_split_history` | 모든 상태 변경 이력 |
| E. 설정 | `users`, `notifications`, `sync_settings` | 시스템 설정 및 알림 |

> 상세 스키마 → [`database/schema.html`](./docs/billing_db_schema.html)  
> 동기화 설계 → [`database/sync-design.html`](./docs/billing_sync_design.html)

### 핵심 설계 포인트

- `patients` 테이블에 `clinic_id` 없음 → `patient_clinic_assignments`로 분리 (클리닉 이동 이력 추적)
- `UNIQUE(clinic_id, billing_month) WHERE status != 'void'` on `invoices`
- 이력 테이블 전체 append-only (삭제 없음)
- `clinics`, `patients`에 `last_synced_at`, `sync_hash` 필드 보유
- EOB 업로드 및 ERA 매칭을 통한 Invoice 생성 프로세스

---

## Story 화면 구성

| Story | 화면 | 역할 |
|---|---|---|
| Story Billing | ERA, Denial, AR Aging | ERA 매칭, Denial 처리, AR Aging 관리 |
| Story Invoice | Invoice & Payment | Invoice 발행, 수금, 정산, Revenue split |
| Story Clinic Settings | Clinic Settings | 클리닉 설정, 데이터 동기화 |

### 핵심 기능 영역

```
Story Billing = ERA, Denial, AR Aging 관리
                "보험사 처리 현황 및 미수금 관리"
                ERA 매칭 / Denial 처리 / AR Aging

Story Invoice = Invoice, Revenue Split, 수금, 정산
                "클리닉 청구 및 정산 관리"
                Invoice 발행 / Revenue split / 수금 / 정산

Story Clinic Settings = 클리닉 설정 및 동기화
                       "시스템 설정 및 데이터 관리"
                       클리닉 정보 / 동기화 설정
```

- EOB 업로드: Invoice 화면에서 처리
- Total Dashboard: 전체 현황 대시보드 제공

---

## 문서 목록

```
rcm-docs/
├── README.md                   ← 이 파일
├── design/
│   ├── story-billing.md        ← ERA, Denial, AR Aging 상세
│   ├── story-invoice.md        ← Invoice, 수금, 정산 상세
│   └── story-clinic.md         ← 클리닉 설정 및 동기화 상세
├── database/
│   ├── schema.html             ← DB 스키마 (전체 테이블)
│   ├── schema.sql              ← CREATE TABLE SQL
│   └── sync-design.html        ← 데이터 동기화 설계서
├── flow/
│   ├── settlement-flow.svg     ← 정산 플로우 다이어그램
│   └── eob-process.svg         ← EOB 업로드 프로세스 다이어그램
└── api/
    └── internal-api.md         ← 프론트-백엔드 내부 API 명세
```

---

## 개발 진행 순서

### Phase 1 — 기반 구축 (백엔드 선행)

- [ ] `schema.sql` 작성 및 리뷰 (`rcm-docs`에 PR)
- [ ] 내부 API 명세 초안 작성 (`api/internal-api.md`)
- [ ] DB 마이그레이션 실행
- [ ] JWT 인증 + 외부 API 연동 확인
- [ ] Full sync 배치 구현 (clinics → patients → billing)

### Phase 2 — 핵심 기능 개발

- [ ] **Backend**: ERA, Denial, AR Aging API 개발
- [ ] **Backend**: Invoice, Revenue split, 수금, 정산 API 개발
- [ ] **Frontend**: Story Billing 화면 구현 (ERA, Denial, AR Aging)
- [ ] **Frontend**: Story Invoice 화면 구현 (Invoice, 수금, 정산)

### Phase 3 — 설정 및 대시보드

- [ ] **Backend**: 클리닉 설정 및 동기화 API 개발
- [ ] **Frontend**: Story Clinic Settings 화면 구현
- [ ] **Frontend**: Total Dashboard 구현
- [ ] EOB 업로드 기능 통합 테스트
- [ ] 전체 시스템 통합 검증

---

## 시작 전 합의 필요 항목

백엔드 개발자와 먼저 확인해야 할 것들입니다.

- [ ] 외부 API 스펙 문서 (Swagger / Postman collection) 수령
- [ ] JWT 발급 endpoint 및 토큰 만료 시간 확인
- [ ] 원서버 네트워크 접근 방식 확인 (IP 허용 범위, VPC 여부)
- [ ] `schema.sql` 리뷰 및 확정
- [ ] 내부 API endpoint 네이밍 규칙 합의
- [ ] 개발/스테이징/프로덕션 환경 구성 방식 합의

---

## 기술 스택 (미확정 항목 포함)

| 영역 | 기술 | 상태 |
|---|---|---|
| Frontend | React / Next.js | 검토 중 |
| Backend | Node.js / Python (미정) | 미확정 |
| Database | PostgreSQL | 확정 |
| 인증 | JWT (외부 API용) | 확정 |
| 배포 | AWS | 확정 |
| 문서 공유 | GitHub (`rcm-docs`) | 확정 |

---

*최종 업데이트: 2025-03-30*
