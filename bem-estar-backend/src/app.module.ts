import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CheckinModule } from './checkin/checkin.module';

@Module({
  imports: [CheckinModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
