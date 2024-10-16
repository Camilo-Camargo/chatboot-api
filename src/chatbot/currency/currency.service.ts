import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CurrencyService {
  constructor(private readonly configService: ConfigService) { }

  /**
   * Converts an amount from one currency to another using open exchange rates API.
   * 
   * @param {number} amount - The amount to convert, should be a non-negative number.
   * @param {string} from - The currency code to convert from (e.g., "USD").
   * @param {string} to - The currency code to convert to (e.g., "EUR").
   * @returns {Promise<number>} - A promise that resolves to the converted amount in the target currency.
   * 
   * @throws {BadRequestException} If there is an error fetching data from the API,
   *                               or if the currency codes are invalid.
   */
  async convert(amount: number, from: string, to: string): Promise<number> {
    const apiUrl = this.configService.get<string>('EXCHANGES_RATE_API');
    const apiId = this.configService.get<string>('EXCHANGES_RATE_ID');

    const response = await fetch(`${apiUrl}/currencies.json`);

    if (!response.ok) {
      throw new BadRequestException(`CurrencyService: Unable to fetch the currency list. Please check the API endpoint: ${apiUrl}`);
    }

    const currencies = await response.json();

    if (!currencies[from] || !currencies[to]) {
      throw new BadRequestException(`CurrencyService: Invalid currency code(s): "${from}" or "${to}". Please ensure both codes are valid.`);
    }

    const ratesResponse = await fetch(`${apiUrl}/latest.json?app_id=${apiId}`);
    if (!ratesResponse.ok) {
      throw new BadRequestException(`CurrencyService: Unable to fetch the latest exchange rates. Please check the API endpoint: ${apiUrl}/latest.json?app_id=${apiId}`);
    }

    const ratesData = await ratesResponse.json();

    if (!ratesData.rates[from] || !ratesData.rates[to]) {
      throw new BadRequestException(`CurrencyService: Exchange rate data not found for the currency code(s): "${from}" or "${to}". Please ensure both codes are valid.`);
    }

    return (amount / ratesData.rates[from]) * ratesData.rates[to];
  }
}
