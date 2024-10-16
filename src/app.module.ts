import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ChatbotModule } from './chatbot/chatbot.module';
import { NplModule } from './npl/npl.module';

@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true
  }), ChatbotModule, NplModule, ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
