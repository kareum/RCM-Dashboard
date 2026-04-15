import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Clinic } from '../../clinics/entities/clinic.entity';
import type { ServiceType } from '../../clinics/entities/clinic.entity';

@Entity('revenue_split_history')
export class RevenueSplitHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'clinic_id', type: 'varchar', length: 36 })
  clinicId: string;

  @ManyToOne(() => Clinic, (c) => c.revenueSplitHistory)
  @JoinColumn({ name: 'clinic_id' })
  clinic: Clinic;

  /** 서비스 종류 — RPM·CCM·BHI·PCM */
  @Column({ name: 'service_type', type: 'varchar', length: 10 })
  serviceType: ServiceType;

  /** 클리닉 정산 비율 (%) */
  @Column({ name: 'clinic_pct', type: 'decimal', precision: 5, scale: 2 })
  clinicPct: number;

  /** Hicare 정산 비율 (%) — clinic_pct + hicare_pct = 100 */
  @Column({ name: 'hicare_pct', type: 'decimal', precision: 5, scale: 2 })
  hicarePct: number;

  /** 적용 시작일 */
  @Column({ name: 'effective_from', type: 'date' })
  effectiveFrom: string;

  @Column({ name: 'changed_by', type: 'varchar', nullable: true })
  changedBy: string;

  @CreateDateColumn({ name: 'changed_at' })
  changedAt: Date;
}
