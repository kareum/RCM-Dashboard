import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Clinic } from './entities/clinic.entity';

@Injectable()
export class ClinicsService {
  constructor(
    @InjectRepository(Clinic)
    private readonly repo: Repository<Clinic>,
  ) {}

  findAll(): Promise<Clinic[]> {
    return this.repo.find({ order: { sortOrder: 'ASC', name: 'ASC' } });
  }

  async findOne(id: string): Promise<Clinic> {
    const clinic = await this.repo.findOne({
      where: { id },
      relations: ['revenueSplitHistory', 'billerFeeHistory'],
    });
    if (!clinic) throw new NotFoundException(`Clinic ${id} not found`);
    return clinic;
  }

  create(data: Partial<Clinic>): Promise<Clinic> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Clinic>): Promise<Clinic> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async updateSyncTime(id: string): Promise<void> {
    await this.repo.update(id, { lastSyncedAt: new Date() });
  }
}
