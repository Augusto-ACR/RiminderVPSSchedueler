import { Module } from '@nestjs/common';

import { RecordatoriosModule } from '../recordatorios/recordatorios.module';
import { SchedulerService } from './scheduler.service';
import { TickStateService } from './tick-state.service';

@Module({
  imports: [RecordatoriosModule],
  providers: [SchedulerService, TickStateService],
  exports: [TickStateService],
})
export class SchedulerModule {}
