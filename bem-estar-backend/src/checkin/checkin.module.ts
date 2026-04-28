// src/checkin/checkin.module.ts
import { Module } from '@nestjs/common';
import { CheckinService } from './checkin.service';
import { CheckinController } from './checkin.controller';
import { PrismaService } from '../prisma.service'; // Importamos o PrismaService

@Module({
  controllers: [CheckinController],
  providers: [CheckinService, PrismaService], // Adicionamos ele na lista de providers
})
export class CheckinModule {}