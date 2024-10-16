import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { NplService } from 'src/npl/npl.service';
import { parse } from 'csv-parse';

// Product interface representing the structure of a product
export interface Product {
  displayTitle: string;
  embeddingText: string;
  url: string;
  imageUrl: string;
  productType: string;
  discount: number;
  price: number;
  variants: string;
  createDate: string;
}

@Injectable()
export class ProductService {
  private products: Product[] = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly nplService: NplService
  ) {
    // Load products from CSV on initialization
    this.loadProducts();
  }

  /**
   * Loads products from a CSV file specified in the configuration.
   * The loaded products are stored in the 'products' array.
   * 
   * @throws {BadRequestException} If the products cannot be loaded due to an error.
   */
  private async loadProducts() {
    try {
      const productsPath = this.configService.get<string>('PRODUCTS_PATH');
      const filePath = path.resolve(__dirname, productsPath);
      this.products = await this.parseCSV(filePath);
    } catch (error) {
      throw new BadRequestException(`Failed to load products: ${error.message}`);
    }
  }

  /**
   * Searches for products by their display title.
   * Uses the NplService to find relevant product indices based on the given name.
   * If products are found, they are returned as a JSON string.
   * 
   * @param {string} name - The name of the product to search for.
   * @returns {Promise<string>} - A JSON string of relevant products.
   * @throws {NotFoundException} If no products are found matching the given name.
   * @throws {BadRequestException} If an error occurs during the search process.
   */
  async searchByName(name: string): Promise<string> {
    try {
      const items = this.products.map(item => item.displayTitle);
      const indices = await this.nplService.searchItems(name, items, 'Must select 2 items.');

      if (indices.length === 0) {
        throw new NotFoundException(`No products found for: ${name}`);
      }

      const relevantProducts = indices.map(index => this.products[index - 1]);
      return JSON.stringify(relevantProducts);
    } catch (error) {
      console.error(`Error during product search:`, error);
      throw new BadRequestException(`Unable to search products: ${error.message}`);
    }
  }

  /**
   * Parses a CSV file and returns an array of Product objects.
   * 
   * @param {string} filePath - The path to the CSV file.
   * @returns {Promise<Product[]>} - A promise that resolves to an array of Product objects.
   * @throws {BadRequestException} If an error occurs while parsing the CSV.
   */
  private async parseCSV(filePath: string): Promise<Product[]> {
    return new Promise((resolve, reject) => {
      const csvParser = parse({ columns: true, skip_empty_lines: true });
      const records: Product[] = [];
      const parser = fs.createReadStream(filePath).pipe(csvParser);

      parser.on('data', (row: Record<string, string>) => {
        records.push(row as unknown as Product);
      });

      parser.on('end', () => {
        resolve(records);
      });

      parser.on('error', (error: Error) => {
        reject(new BadRequestException(`Error parsing CSV: ${error.message}`));
      });
    });
  }
}
