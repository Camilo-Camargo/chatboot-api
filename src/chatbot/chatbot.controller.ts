import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { ChatbotReq, ChatbotRes, ChatbotService } from './chatbot.service';

@ApiTags('chatbot')
@Controller('chatbot')
export class ChatbotController {
  constructor(private readonly service: ChatbotService) { }

  @Post()
  @ApiOperation({ summary: 'Chatbot Interaction' })
  @ApiBody({
    description: 'Chatbot request payload',
    type: ChatbotReq,
    examples: {
      example1: {
        value: { input: "I am looking for a phone" },
        summary: "Request for a phone"
      },
      example2: {
        value: { input: "I am looking for a present for my dad" },
        summary: "Request for a present for dad"
      },
      example3: {
        value: { input: "How much does a watch costs?" },
        summary: "Inquiry about watch price"
      },
      example4: {
        value: { input: "What is the price of the watch in Euros?" },
        summary: "Price inquiry for watch in Euros"
      },
      example5: {
        value: { input: "How many Canadian Dollars are 350 Euros?" },
        summary: "Currency conversion inquiry"
      }
    }
  })
  @ApiResponse({
    status: 200,
    description: 'Successful response from the chatbot',
    type: ChatbotRes,
    example: {
      value: {
        response: "Here are some options for phones that you might be interested in:\n\n1. **iPhone 12**\n   - Price: $900.0 USD\n   - Variants: Color (Black, Blue, Red, Green, White), Capacity (64gb, 128gb)\n   - [Check it out here](https://wizybot-demo-store.myshopify.com/products/iphone-12)\n   - ![iPhone 12](https://cdn.shopify.com/s/files/1/0779/8125/3922/files/ScreenShot2023-06-21at4.49.19PM.png?v=1687384318)\n   \n2. **iPhone 13**\n   - Price: $1099.0 USD\n   - Variants: Color (Black, Blue), Capacity (256gb, 128gb)\n   - [Check it out here](https://wizybot-demo-store.myshopify.com/products/iphone-13)\n   - ![iPhone 13](https://cdn.shopify.com/s/files/1/0779/8125/3922/files/ScreenShot2023-06-21at5.00.26PM.png?v=1687384930)\n\nLet me know if any of these options catch your eye!"
      },
      summary: "Response containing phone options"
    }
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request'
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error'
  })
  async chatbot(@Body() req: ChatbotReq): Promise<ChatbotRes> {
    return await this.service.chatbot(req);
  }
}
