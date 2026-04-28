// src/checkin/checkin.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { CheckinService } from './checkin.service';

@Controller('checkin') // Define a rota como localhost:3000/checkin
export class CheckinController {
  constructor(private readonly checkinService: CheckinService) {}

  @Post()
  async fazerCheckin(
    @Body('userId') userId: string,
    @Body('sono') sono: string,
    @Body('humor') humor: string,
    @Body('alimentacao') alimentacao: string,
  ) {
    // Repassa os dados recebidos do app para o serviço que acabamos de criar
    return this.checkinService.criarCheckin(userId, sono, humor, alimentacao);
  }
}