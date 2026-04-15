import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Clinic } from '../../clinics/entities/clinic.entity';

export type CiMethod = 'ACH' | 'Zelle' | 'Check';
export type EntryStatus = 'paid' | 'unpaid';

/**
 * invoice_entries
 * 클리닉별 월별 청구 입력 + HicareNet 입금 확인 레코드
 * (clinic_id + billing_year + billing_month) 조합은 유니크
 */
@Entity('invoice_entries')
@Unique(['clinicId', 'billingYear', 'billingMonth'])
export class InvoiceEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'clinic_id', type: 'varchar', length: 36 })
  clinicId: string;

  @ManyToOne(() => Clinic, (c) => c.invoiceEntries)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  /** 청구 연도 */
  @Column({ name: 'billing_year', type: 'smallint' })
  billingYear: number;

  /** 청구 월 (1-12) */
  @Column({ name: 'billing_month', type: 'tinyint' })
  billingMonth: number;

  // ── Invoice 입력 ─────────────────────────────────────────────

  @Column({
    name: 'rpm_invoice',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  rpmInvoice: number | null;

  @Column({
    name: 'ccm_invoice',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  ccmInvoice: number | null;

  @Column({ name: 'rpm_pts', type: 'smallint', nullable: true })
  rpmPts: number | null;

  @Column({ name: 'ccm_pts', type: 'smallint', nullable: true })
  ccmPts: number | null;

  // ── CI — HicareNet 입금 확인 ─────────────────────────────────

  /** HicareNet이 실제로 입금받은 금액 */
  @Column({
    name: 'ci_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
    nullable: true,
  })
  ciAmount: number | null;

  @Column({ name: 'ci_date', type: 'date', nullable: true })
  ciDate: string | null;

  @Column({ name: 'ci_method', type: 'varchar', length: 10, nullable: true })
  ciMethod: CiMethod | null;

  @Column({ name: 'ci_reference', type: 'varchar', nullable: true })
  ciReference: string | null;

  @Column({ name: 'ci_remark', type: 'text', nullable: true })
  ciRemark: string | null;

  // ── 상태 ─────────────────────────────────────────────────────

  @Column({ type: 'varchar', length: 10, default: 'unpaid' })
  status: EntryStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
