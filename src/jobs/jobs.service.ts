import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { PrismaService } from 'src/prisma/prisma.service';

import { Job, JobStatus } from 'src/generated/prisma/client';
import { JobsGateway } from './jobs.gateway';

@Injectable()
export class JobsService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jobsGateway: JobsGateway,
  ) {}

  private readonly logger = new Logger(JobsService.name);

  async create(createJobDto: CreateJobDto): Promise<{ jobId: string }> {
    const { selectedWish, weight } = createJobDto;
    const job = await this.prismaService.job.create({
      data: {
        selectedWish,
        weight,
        progress: 0,
      },
    });

    this.processJobPipeline(job.id);

    return { jobId: job.id };
  }

  private async processJobPipeline(jobId: string) {
    this.logger.log(`Starting job pipeline for job ${jobId}`);
    try {
      await this.updateAndNotify(jobId, JobStatus.PROCESSING, 10);
      this.logger.log(`Job ${jobId} progress: 10%`);
      await this.delay(2000);
      await this.updateAndNotify(jobId, JobStatus.PROCESSING, 50);
      this.logger.log(`Job ${jobId} progress: 50%`);

      await this.delay(2000);
      await this.updateAndNotify(jobId, JobStatus.PROCESSING, 90);
      this.logger.log(`Job ${jobId} progress: 90%`);
      await this.delay(1000);
      await this.updateAndNotify(jobId, JobStatus.DONE, 100);
      this.logger.log(`Job ${jobId} completed successfully`);
    } catch (error) {
      this.logger.error(`Job ${jobId} failed: ${error.message}`);
      await this.updateAndNotify(jobId, JobStatus.FAILED, 0);
    }
  }

  private async updateAndNotify(
    id: string,
    status: JobStatus,
    progress: number,
  ) {
    const updatedJob = await this.prismaService.job.update({
      where: { id },
      data: { status, progress },
    });

    this.jobsGateway.sendStatusUpdate(id, {
      status: updatedJob.status,
      progress: updatedJob.progress,
    });
  }

  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async findJob(id: string): Promise<Job | null> {
    const normalizedId = id.trim();
    const job = await this.prismaService.job.findUnique({
      where: { id: normalizedId },
    });

    if (!job) {
      throw new NotFoundException(`Job with ID ${id} not found`);
    }

    return job;
  }
}
