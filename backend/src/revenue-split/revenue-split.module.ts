import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevenueSplitHistory } from './entities/revenue-split-history.entity';
import { RevenueSplitService } from './revenue-split.service';
import { RevenueSplitController } from './revenue-split.controller';

@Module({
  imports: [TypeOrmModule.forFeature([RevenueSplitHistory])],
  controllers: [RevenueSplitController],
  providers: [RevenueSplitService],
  exports: [RevenueSplitService],
})
export class RevenueSplitModule {}
