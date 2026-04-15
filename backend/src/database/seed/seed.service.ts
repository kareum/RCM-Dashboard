import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Clinic } from '../../clinics/entities/clinic.entity';
import { RevenueSplitHistory } from '../../revenue-split/entities/revenue-split-history.entity';
import { BillerFeeHistory } from '../../biller-fee/entities/biller-fee-history.entity';
import { InvoiceEntry } from '../../invoice-entry/entities/invoice-entry.entity';
import { CLINICS_SEED } from './data/clinics.seed';
import {
  REVENUE_SPLIT_SEED,
  BILLER_FEE_SEED,
} from './data/billing-settings.seed';
import { INVOICE_ENTRIES_SEED } from './data/invoice-entries.seed';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Clinic) private readonly clinicRepo: Repository<Clinic>,
    @InjectRepository(RevenueSplitHistory)
    private readonly splitRepo: Repository<RevenueSplitHistory>,
    @InjectRepository(BillerFeeHistory)
    private readonly feeRepo: Repository<BillerFeeHistory>,
    @InjectRepository(InvoiceEntry)
    private readonly entryRepo: Repository<InvoiceEntry>,
    private readonly dataSource: DataSource,
  ) {}

  /** 앱 시작 시 자동 실행 — 이미 데이터가 있으면 skip */
  async onApplicationBootstrap() {
    const count = await this.clinicRepo.count();
    if (count > 0) {
      this.logger.log(`Seed skipped — clinics table already has ${count} rows`);
      return;
    }
    await this.run();
  }

  async run() {
    this.logger.log('Starting seed...');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Clinics
      const clinics = await this.clinicRepo.save(
        CLINICS_SEED.map((c) => this.clinicRepo.create(c)),
      );
      this.logger.log(`  ✓ ${clinics.length} clinics inserted`);

      // code → id 맵
      const codeToId = Object.fromEntries(clinics.map((c) => [c.code, c.id]));

      // 2. Revenue split history (이력 포함)
      const splitRows = REVENUE_SPLIT_SEED.filter(
        (r) => codeToId[r.clinicCode],
      ).map((r) =>
        this.splitRepo.create({
          clinicId: codeToId[r.clinicCode],
          serviceType: r.serviceType,
          clinicPct: r.clinicPct,
          hicarePct: r.hicarePct,
          effectiveFrom: r.effectiveFrom,
          changedBy: 'seed',
        }),
      );
      await this.splitRepo.save(splitRows);
      this.logger.log(`  ✓ ${splitRows.length} revenue split rows inserted`);

      // 3. Biller fee history (이력 포함)
      const feeRows = BILLER_FEE_SEED.filter((r) => codeToId[r.clinicCode]).map(
        (r) =>
          this.feeRepo.create({
            clinicId: codeToId[r.clinicCode],
            feeType: r.feeType,
            feeValue: r.feeValue,
            effectiveFrom: r.effectiveFrom,
            note: r.note ?? undefined,
            changedBy: 'seed',
          }),
      );
      await this.feeRepo.save(feeRows);
      this.logger.log(`  ✓ ${feeRows.length} biller fee rows inserted`);

      // 4. Invoice entries
      const entryRows = INVOICE_ENTRIES_SEED.filter(
        (e) => codeToId[e.clinicCode],
      ).map((e) =>
        this.entryRepo.create({
          clinicId: codeToId[e.clinicCode],
          billingYear: e.billingYear,
          billingMonth: e.billingMonth,
          rpmInvoice: e.rpmInvoice,
          ccmInvoice: e.ccmInvoice,
          ciAmount: e.ciAmount,
          status: e.status,
        }),
      );
      await this.entryRepo.save(entryRows);
      this.logger.log(`  ✓ ${entryRows.length} invoice entries inserted`);

      await queryRunner.commitTransaction();
      this.logger.log('Seed completed successfully');
    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Seed failed — transaction rolled back', err);
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
