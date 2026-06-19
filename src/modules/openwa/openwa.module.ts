import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { OpenwaClient } from './openwa.client';

@Module({
  imports: [HttpModule],
  providers: [OpenwaClient],
  exports: [OpenwaClient],
})
export class OpenwaModule {}
