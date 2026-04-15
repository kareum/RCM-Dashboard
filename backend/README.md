# HCN RCM — Backend

NestJS + TypeORM + MySQL 기반 RCM(Revenue Cycle Management) 백엔드 서버.

---

## 기술 스택

| 항목 | 버전 |
|---|---|
| Node.js | 20+ |
| NestJS | 11 |
| TypeORM | 0.3 |
| MySQL | 8.0 |
| TypeScript | 5.7 |

---

## 시작하기

### 1. 환경변수 설정

`backend/.env` 파일을 생성합니다.

```env
PORT=3001

DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=rcm_root
DB_PASSWORD=rcm00!!
DB_DATABASE=rcm_db
```

> MySQL은 루트 프로젝트의 `docker-compose.yml`로 실행합니다.

### 2. MySQL 실행 (Docker)

```bash
# 프로젝트 루트에서 실행
docker compose up -d
```

### 3. 백엔드 실행

```bash
cd backend
npm install
npm run start:dev   # 개발 (watch 모드)
npm run start:prod  # 프로덕션
```

개발 모드에서는 `synchronize: true`가 활성화되어 Entity 변경 시 테이블이 자동으로 생성/수정됩니다.

서버 주소: `http://localhost:3001/api`

---

## 프로젝트 구조

```
src/
├── app.module.ts                  # 루트 모듈 — ConfigModule, TypeORM 설정
├── main.ts                        # 진입점 — CORS, /api prefix
│
├── clinics/                       # 클리닉 기본 정보
│   ├── entities/clinic.entity.ts
│   ├── clinics.module.ts
│   ├── clinics.service.ts
│   └── clinics.controller.ts
│
├── revenue-split/                 # 수익 분배 이력
│   ├── entities/revenue-split-history.entity.ts
│   ├── revenue-split.module.ts
│   ├── revenue-split.service.ts
│   └── revenue-split.controller.ts
│
└── biller-fee/                    # 빌러 수수료 이력
    ├── entities/biller-fee-history.entity.ts
    ├── biller-fee.module.ts
    ├── biller-fee.service.ts
    └── biller-fee.controller.ts
```

---

## DB 설계 (ERD)

### clinics

클리닉 기본 정보. CMS-1500 청구서에 사용되는 필드를 포함합니다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | varchar(36) PK | UUID 자동 생성 |
| `name` | varchar | 클리닉 명 |
| `code` | varchar(3) UNIQUE | 3자리 고유 코드 — 생성 후 변경 불가 |
| `state` | varchar(2) | 주(State) 코드 |
| `timezone` | varchar | 타임존 |
| `phone` | varchar | 대표 전화 |
| `address` | text | 주소 |
| `contact_name` | varchar | 담당자 이름 |
| `ein` | varchar | CMS-1500 Box 25 |
| `npi` | varchar | CMS-1500 Box 33a |
| `taxonomy_code` | varchar | CMS-1500 Box 33b |
| `pos_code` | varchar(2) | CMS-1500 Box 24B |
| `accept_assignment` | boolean | CMS-1500 Box 27 (기본값: true) |
| `service_types` | json | 계약 서비스 — RPM·CCM·BHI·PCM |
| `emr_links` | json | 연동 EMR 목록 `[{name, url}]` |
| `sort_order` | int | 목록 정렬 순서 (드래그 변경 가능) |
| `is_active` | boolean | 활성 여부 |
| `last_synced_at` | timestamp | 마지막 동기화 시각 |
| `created_at` | timestamp | 생성일 |

### revenue_split_history

클리닉별·서비스 종류별 수익 분배 비율 변경 이력. `clinic_pct + hicare_pct = 100`.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | varchar(36) PK | UUID |
| `clinic_id` | varchar(36) FK | clinics.id |
| `service_type` | varchar | RPM·CCM·BHI·PCM |
| `clinic_pct` | decimal(5,2) | 클리닉 정산 비율 (%) |
| `hicare_pct` | decimal(5,2) | Hicare 정산 비율 (%) |
| `effective_from` | date | 적용 시작일 |
| `changed_by` | varchar | 변경자 |
| `changed_at` | timestamp | 변경일시 |

### biller_fee_history

클리닉별 빌러 수수료 변경 이력.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | varchar(36) PK | UUID |
| `clinic_id` | varchar(36) FK | clinics.id |
| `fee_type` | varchar | `pct` (%) 또는 `fixed` ($/mo) |
| `fee_value` | decimal(8,2) | 수수료 값. 음수: 청구 차감(클리닉 부담), 양수: Hicare 부담 |
| `effective_from` | date | 적용 시작일 |
| `note` | text | 비고 (마이너스 사유 등) |
| `changed_by` | varchar | 변경자 |
| `changed_at` | timestamp | 변경일시 |

### 관계

```
clinics 1 ──< N revenue_split_history
clinics 1 ──< N biller_fee_history
```

---

## API 엔드포인트

Base URL: `http://localhost:3001/api`

### Clinics

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/clinics` | 클리닉 목록 (sort_order ASC) |
| `GET` | `/clinics/:id` | 클리닉 상세 (split/fee 이력 포함) |
| `PATCH` | `/clinics/:id` | 클리닉 정보 수정 |
| `PATCH` | `/clinics/:id/sync` | 마지막 동기화 시각 갱신 |

### Revenue Split

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/clinics/:clinicId/revenue-split` | 수익 분배 이력 전체 |
| `GET` | `/clinics/:clinicId/revenue-split?serviceType=RPM` | 서비스 종류별 이력 |
| `POST` | `/clinics/:clinicId/revenue-split` | 새 분배 비율 등록 |

### Biller Fee

| Method | Path | 설명 |
|---|---|---|
| `GET` | `/clinics/:clinicId/biller-fee` | 수수료 이력 |
| `POST` | `/clinics/:clinicId/biller-fee` | 새 수수료 등록 |

---

## 타입 매핑 (PostgreSQL ERD → MySQL)

ERD는 PostgreSQL 표기를 사용했으나 실제 DB는 MySQL 8.0입니다.

| ERD 타입 | MySQL 실제 타입 | 비고 |
|---|---|---|
| `uuid` | `varchar(36)` | TypeORM `@PrimaryGeneratedColumn('uuid')` |
| `varchar[]` | `json` | service_types 배열 |
| `jsonb` | `json` | emr_links 객체 배열 |
| `numeric(8,2)` | `decimal(8,2)` | fee_value |
| `numeric` | `decimal(5,2)` | clinic_pct, hicare_pct |
