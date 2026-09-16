import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../../db/entities/system-config.entity';

@Injectable()
export class SystemConfigService {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly configRepository: Repository<SystemConfig>,
  ) {}

  async get(key: string, defaultValue = ''): Promise<string> {
    const config = await this.configRepository.findOne({ where: { key } });
    return config ? config.value : defaultValue;
  }

  async getNumber(key: string, defaultValue = 0): Promise<number> {
    const val = await this.get(key, defaultValue.toString());
    const parsed = parseFloat(val);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  async set(key: string, value: string, description?: string): Promise<SystemConfig> {
    let config = await this.configRepository.findOne({ where: { key } });
    if (config) {
      config.value = value;
      if (description) config.description = description;
    } else {
      config = this.configRepository.create({ key, value, description });
    }
    return this.configRepository.save(config);
  }

  async getFixedCommission(): Promise<number> {
    // Default fixed commission: 20 EGP per student course purchase
    return this.getNumber('platform_commission_fixed_amount', 20);
  }
}
