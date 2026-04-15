import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Clinic } from './clinics/entities/clinic.entity';
import { RevenueSplitHistory } from './revenue-split/entities/revenue-split-history.entity';
import { BillerFeeHistory } from './biller-fee/entities/biller-fee-history.entity';
import { InvoiceEntry } from './invoice-entry/entities/invoice-entry.entity';
import { ClinicsModule } from './clinics/clinics.module';
import { RevenueSplitModule } from './revenue-split/revenue-split.module';
import { BillerFeeModule } from './biller-fee/biller-fee.module';
import { InvoiceEntryModule } from './invoice-entry/invoice-entry.module';
import { SeedModule } from './database/seed/seed.module';

@Module({
  imports: [
    // .env 로드 (전역)
    ConfigModule.forRoot({ isGlobal: true }),

    // TypeORM — MySQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        type: 'mysql',
        host: cfg.get<string>('DB_HOST', 'localhost'),
        port: cfg.get<number>('DB_PORT', 3306),
        username: cfg.get<string>('DB_USERNAME'),
        password: cfg.get<string>('DB_PASSWORD'),
        database: cfg.get<string>('DB_DATABASE'),
        entities: [Clinic, RevenueSplitHistory, BillerFeeHistory, InvoiceEntry],
        synchronize: cfg.get('NODE_ENV') !== 'production',
        logging: cfg.get('NODE_ENV') === 'development',
      }),
    }),

    ClinicsModule,
    RevenueSplitModule,
    BillerFeeModule,
    InvoiceEntryModule,
    SeedModule,
  ],
})
export class AppModule {}
