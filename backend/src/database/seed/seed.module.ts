import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinic } from '../../clinics/entities/clinic.entity';
import { RevenueSplitHistory } from '../../revenue-split/entities/revenue-split-history.entity';
import { BillerFeeHistory } from '../../biller-fee/entities/biller-fee-history.entity';
import { InvoiceEntry } from '../../invoice-entry/entities/invoice-entry.entity';
import { SeedService } from './seed.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Clinic,
      RevenueSplitHistory,
      BillerFeeHistory,
      InvoiceEntry,
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
