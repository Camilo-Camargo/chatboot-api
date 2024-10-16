import { Module } from '@nestjs/common';
import { ChatbotController } from './chatbot.controller';
import { ChatbotService } from './chatbot.service';
import { NplModule } from 'src/npl/npl.module';
import { ProductService } from './product/product.service';
import { CurrencyService } from './currency/currency.service';

@Module({
  imports: [NplModule],
  controllers: [ChatbotController],
  providers: [ChatbotService, CurrencyService, ProductService]
})
export class ChatbotModule {}
