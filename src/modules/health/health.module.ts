import { Module } from '@nestjs/common';

import { SchedulerModule } from '../scheduler/scheduler.module';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

@Module({
  imports: [SchedulerModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
