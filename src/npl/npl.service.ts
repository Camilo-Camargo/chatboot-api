import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OpenAI } from 'openai';

export type NPLFunctionCallingCallback = (params: any) => Promise<any>;

export type NPLFunctionCallingParams = {
  name: string;
  description: string;
  type: 'string' | 'number';
  required: boolean;
};

export interface NPLFunction {
  name: string;
  description: string;
  callback: NPLFunctionCallingCallback;
  params: NPLFunctionCallingParams[];
}

@Injectable()
export class NplService {
  private client: OpenAI;
  private model = 'gpt-3.5-turbo';

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({ apiKey: this.configService.get('OPENAI_KEY') });
  }

  /**
   * Handles function calling based on user input and registered callbacks.
   * 
   * @param input - The user input string for processing.
   * @param callbacks - An array of NPLFunction that defines callable functions.
   * @returns A promise that resolves to the final response string from the OpenAI model.
   * @throws BadRequestException if there are issues with function execution or API calls.
   */
  async functionCalling(input: string, callbacks: NPLFunction[]) {
    const requiredParams: string[] = [];
    const properties = callbacks.reduce((acc, { params }) => {
      params.forEach(param => {
        if (param.required) requiredParams.push(param.name);
        acc[param.name] = {
          type: param.type,
          description: param.description,
        };
      });
      return acc;
    }, {} as Record<string, { type: 'string' | 'number'; description: string }>);

    const functions = callbacks.map(({ name, description }) => ({
      type: "function" as const,
      function: {
        name,
        description,
        parameters: {
          type: 'object',
          properties,
          required: requiredParams,
          additionalProperties: false,
        },
      },
    }));

    const functionList = callbacks.map((fn, index) =>
      `${index + 1}. ${fn.name}(${fn.params.map(p => p.name).join(', ')})`
    ).join(' ');

    const messages: any = [
      {
        role: "system",
        content: `You are a helpful customer support assistant. Use the following functions: ${functionList}`
      },
      {
        role: 'user',
        content: input,
      },
    ];

    try {
      let llmResponse = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
        tools: functions,
      });

      while (llmResponse.choices[0].finish_reason === "tool_calls") {
        const tools = llmResponse.choices[0].message.tool_calls;
        messages.push(llmResponse.choices[0].message);

        for await (const tool of tools) {
          const { name, arguments: args } = tool.function;
          const callback = this.getCallbackByFunctionName(callbacks, name);
          const functionResult = await callback(JSON.parse(args));
          const toolResponse = { role: "tool", content: functionResult, tool_call_id: tool.id };
          messages.push(toolResponse);
        }

        messages.push({ role: "system", content: `Don't ask the user, always do if there is some function list ${functionList}` });

        llmResponse = await this.client.chat.completions.create({
          model: this.model,
          messages: messages,
          tools: functions
        });
      }

      const finalMessage = [
        { role: 'user', content: input },
        {
          role: 'system',
          content: `A user asks: "${input}". The result was: ${llmResponse.choices[0].message.content}. Formulate a final response.`,
        },
      ];

      const finalResponse = await this.client.chat.completions.create({
        model: this.model,
        messages: finalMessage as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      });

      return finalResponse.choices[0]?.message.content.trim();

    } catch (error) {
      console.error('Error in functionCalling:', error);
      throw new BadRequestException(`Function calling error: ${error.message}`);
    }
  }

  /**
   * Retrieves a callback function by its name.
   * 
   * @param callbacks - An array of NPLFunction that defines callable functions.
   * @param functionName - The name of the function to retrieve.
   * @returns The callback function associated with the given name.
   * @throws BadRequestException if the function name does not exist in the callbacks.
   */
  private getCallbackByFunctionName(callbacks: NPLFunction[], functionName: string) {
    const callback = callbacks.find(cb => cb.name === functionName)?.callback;
    if (!callback) {
      throw new BadRequestException(`Function ${functionName} not found`);
    }
    return callback;
  }

  /**
   * Searches for items based on a search term and returns their indices.
   * 
   * @param searchTerm - The term to search for within the items.
   * @param items - An array of item strings to search through.
   * @param constraints - Any constraints to apply to the search.
   * @returns A promise that resolves to an array of relevant item indices.
   * @throws BadRequestException if the response format is invalid.
   */
  async searchItems(searchTerm: string, items: string[], constraints: string): Promise<number[]> {
    const enumeratedItems = items.map((item, index) => `${index + 1}. ${item}`).join('\n');
    const messages = [
      {
        role: 'user',
        content: `Please find items related to "${searchTerm}". ${constraints ? "with the following constraints " + constraints : ""}`
      },
      {
        role: 'system',
        content: `You are a helpful assistant. Based on the user's query, return a JSON array containing the indices without any decoration of the relevant items from the following list:\n${enumeratedItems}`
      }
    ];

    try {
      const llmResponse = await this.client.chat.completions.create({
        model: this.model,
        messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      });

      const responseMessage = llmResponse.choices[0].message.content;
      const relevantIndices: number[] = this.validateResponseFormat(responseMessage);
      return relevantIndices;
    } catch (error) {
      console.error('Failed to fetch or parse response in searchItems:', error);
      return [];
    }
  }

  /**
   * Validates the format of the response message to ensure it is an array of integers.
   * 
   * @param responseMessage - The response message string to validate.
   * @returns An array of indices parsed from the response message.
   * @throws BadRequestException if the response format is invalid.
   */
  private validateResponseFormat(responseMessage: string): number[] {
    try {
      const relevantIndices = JSON.parse(responseMessage);
      if (!Array.isArray(relevantIndices) || !relevantIndices.every(Number.isInteger)) {
        throw new Error(`Invalid response format: ${responseMessage}`);
      }
      return relevantIndices;
    } catch (error) {
      console.error(`Validation error: ${error.message}`);
      throw new BadRequestException(`Invalid response format from search: ${responseMessage}`);
    }
  }
}
