import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { RevenueSplitHistory } from '../../revenue-split/entities/revenue-split-history.entity';
import { BillerFeeHistory } from '../../biller-fee/entities/biller-fee-history.entity';
import { InvoiceEntry } from '../../invoice-entry/entities/invoice-entry.entity';

export type ServiceType = 'RPM' | 'CCM' | 'BHI' | 'PCM';

export interface EmrLink {
  name: string;
  url: string;
}

@Entity('clinics')
export class Clinic {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  /** 3자리 고유 코드 — 생성 후 변경 불가 */
  @Column({ type: 'varchar', length: 3, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 2, nullable: true })
  state: string;

  @Column({ type: 'varchar', nullable: true })
  timezone: string;

  @Column({ type: 'varchar', nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ name: 'contact_name', type: 'varchar', nullable: true })
  contactName: string;

  /** CMS-1500 Box 25 */
  @Column({ type: 'varchar', nullable: true })
  ein: string;

  /** CMS-1500 Box 33a */
  @Column({ type: 'varchar', nullable: true })
  npi: string;

  /** CMS-1500 Box 33b */
  @Column({ name: 'taxonomy_code', type: 'varchar', nullable: true })
  taxonomyCode: string;

  /** CMS-1500 Box 24B */
  @Column({ name: 'pos_code', type: 'varchar', length: 2, nullable: true })
  posCode: string;

  /** CMS-1500 Box 27 */
  @Column({ name: 'accept_assignment', type: 'boolean', default: true })
  acceptAssignment: boolean;

  /** 계약된 서비스 종류 — RPM·CCM·BHI·PCM */
  @Column({ name: 'service_types', type: 'json', nullable: true })
  serviceTypes: ServiceType[];

  /** 연동 EMR 목록 [{name, url}] */
  @Column({ name: 'emr_links', type: 'json', nullable: true })
  emrLinks: EmrLink[];

  /** 좌측 목록 정렬 순서 — 드래그로 변경 가능 */
  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'last_synced_at', type: 'timestamp', nullable: true })
  lastSyncedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => RevenueSplitHistory, (h) => h.clinic)
  revenueSplitHistory: RevenueSplitHistory[];

  @OneToMany(() => BillerFeeHistory, (h) => h.clinic)
  billerFeeHistory: BillerFeeHistory[];

  @OneToMany(() => InvoiceEntry, (e) => e.clinic)
  invoiceEntries: InvoiceEntry[];
}
