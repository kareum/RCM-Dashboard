import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { RevenueSplitService } from './revenue-split.service';
import { RevenueSplitHistory } from './entities/revenue-split-history.entity';
import type { ServiceType } from '../clinics/entities/clinic.entity';

@Controller('clinics/:clinicId/revenue-split')
export class RevenueSplitController {
  constructor(private readonly service: RevenueSplitService) {}

  @Get()
  findAll(
    @Param('clinicId') clinicId: string,
    @Query('serviceType') serviceType?: ServiceType,
  ): Promise<RevenueSplitHistory[]> {
    if (serviceType)
      return this.service.findByClinicAndType(clinicId, serviceType);
    return this.service.findByClinic(clinicId);
  }

  @Post()
  create(
    @Param('clinicId') clinicId: string,
    @Body() body: Partial<RevenueSplitHistory>,
  ): Promise<RevenueSplitHistory> {
    return this.service.create({ ...body, clinicId });
  }
}
