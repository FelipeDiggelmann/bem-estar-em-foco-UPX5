// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'; // Importa o leitor de .env
import { CheckinModule } from './checkin/checkin.module';

@Module({
  imports: [
    ConfigModule.forRoot(), // LIGA o leitor de variáveis de ambiente!
    CheckinModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}