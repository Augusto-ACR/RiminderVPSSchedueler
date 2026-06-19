import { Module } from '@nestjs/common';

import { EventosRepository } from './eventos.repository';

@Module({
  providers: [EventosRepository],
  exports: [EventosRepository],
})
export class EventosModule {}
