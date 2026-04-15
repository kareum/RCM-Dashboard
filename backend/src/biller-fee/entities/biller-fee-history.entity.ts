import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Clinic } from '../../clinics/entities/clinic.entity';

export type FeeType = 'pct' | 'fixed';

@Entity('biller_fee_history')
export class BillerFeeHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'clinic_id', type: 'varchar', length: 36 })
  clinicId: string;

  @ManyToOne(() => Clinic, (c) => c.billerFeeHistory)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  /** 수수료 방식: pct(%) 또는 fixed($/mo) */
  @Column({ name: 'fee_type', type: 'varchar', length: 10 })
  feeType: FeeType;

  /**
   * 수수료 값
   * 음수: 청구 금액에서 차감 (클리닉 부담)
   * 양수: 회사(Hicare) 부담
   */
  @Column({ name: 'fee_value', type: 'decimal', precision: 8, scale: 2 })
  feeValue: number;

  /** 적용 시작일 */
  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom: string;

  /** 마이너스 사유 등 비고 */
  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ name: 'changed_by', type: 'varchar', nullable: true })
  changedBy: string;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;
}
