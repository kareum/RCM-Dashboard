import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoiceEntry } from './entities/invoice-entry.entity';
import { InvoiceEntryService } from './invoice-entry.service';
import { InvoiceEntryController } from './invoice-entry.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InvoiceEntry])],
  controllers: [InvoiceEntryController],
  providers: [InvoiceEntryService],
  exports: [InvoiceEntryService],
})
export class InvoiceEntryModule {}
