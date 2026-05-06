// src/checkin/checkin.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CheckinService } from './checkin.service';

@Controller('checkin')
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post()
  async fazerCheckin(
    @Body('userId') userId: string,
    @Body('sono') sono: string,
    @Body('humor') humor: string,
    @Body('alimentacao') alimentacao: string,
    @Body('atividadeFisica') atividadeFisica?: string,
    @Body('foco') foco?: string,
  ) {
    return this.checkinService.criarCheckin(
      userId, 
      sono, 
      humor, 
      alimentacao, 
      atividadeFisica, 
      foco
    );
  }

  // NOVA ROTA: GET /checkin/:userId
  @Get(':userId')
  async obterHistorico(@Param('userId') userId: string) {
    return this.checkinService.buscarHistorico(userId);
  }
}