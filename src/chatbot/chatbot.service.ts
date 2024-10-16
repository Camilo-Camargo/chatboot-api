import { Injectable, BadRequestException } from '@nestjs/common';
import { NPLFunction, NplService } from 'src/npl/npl.service';
import { ProductService } from './product/product.service';
import { CurrencyService } from './currency/currency.service';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ChatbotReq {
  @ApiProperty({
    description: 'User input message for the chatbot',
    example: 'I am looking for a phone',
  })
  @IsString()
  input: string;
}

export class ChatbotRes {
  @ApiProperty({
    description: 'Response message from the chatbot',
    example: 'Here are some options for phones that you might be interested in...',
  })
  response: string;
}

@Injectable()
export class ChatbotService {
  constructor(
    private readonly nplService: NplService,
    private readonly productService: ProductService,
    private readonly currencyService: CurrencyService,
  ) {}

  async chatbot(req: ChatbotReq): Promise<ChatbotRes> {
    const input = req.input; 

    // Define the functions that can be called by the tool call using function calling.
    // I created a function to allow for the addition of more than the following two functions, 
    // making it easier to use with multiple function calls.
    const functions: NPLFunction[] = [
      {
        name: 'convertCurrencies',
        description: 'Convert a specified amount from one currency to another',
        callback: async (params: any) => {
          const converted = await this.currencyService.convert(params.amount, params.from, params.to);
          return converted.toString(); // Ensure conversion returns a string.
        },
        params: [
          {
            name: 'amount',
            description: 'Amount to convert (e.g., 100).',
            type: 'number',
            required: true,
          },
          {
            name: 'from',
            description: 'Currency code to convert from (e.g., "COP").',
            type: 'string',
            required: true,
          },
          {
            name: 'to',
            description: 'Currency code to convert to (e.g., "USD").',
            type: 'string',
            required: true,
          },
        ],
      },
      {
        name: 'searchProducts',
        description: 'Search for products in the inventory',
        callback: async (params: any) => this.productService.searchByName(params.name),
        params: [
          { name: 'name', description: 'Name of the product', type: 'string', required: true },
        ],
      },
    ];

    try {
      const response = await this.nplService.functionCalling(input, functions);
      return { response };
    } catch (error) {
      console.error('Error processing chatbot request:', error);
      throw new BadRequestException(`Chatbot error: ${error.message}`);
    }
  }
}
