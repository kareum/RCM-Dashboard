import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BillerFeeHistory } from './entities/biller-fee-history.entity';
import { BillerFeeService } from './biller-fee.service';
import { BillerFeeController } from './biller-fee.controller';

@Module({
  imports: [TypeOrmModule.forFeature([BillerFeeHistory])],
  controllers: [BillerFeeController],
  providers: [BillerFeeService],
  exports: [BillerFeeService],
})
export class BillerFeeModule {}
