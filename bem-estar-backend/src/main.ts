// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Liberando a segurança do navegador (CORS) 👇
  app.enableCors(); 

  await app.listen(3000);
}
bootstrap();