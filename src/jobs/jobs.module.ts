import { Module } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { JobsGateway } from './jobs.gateway';

@Module({
  controllers: [JobsController],
  providers: [JobsService, JobsGateway],
})
export class JobsModule {}
