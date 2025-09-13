import { GoogleGenAI } from '@google/genai';
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { Provider } from 'src/shared/enums/provider';

@Injectable()
export class ProviderService {
  private provider: OpenAI | GoogleGenAI;
  private providerType: Provider;

  constructor() {
    this.providerType = Provider.OPENAI;
    this.initializeProvider();
  }

  private initializeProvider(): void {
    switch (this.providerType) {
      case Provider.OPENAI:
        this.provider = new OpenAI({
          apiKey: process.env.OPENAI_API_KEY,
        });
        break;
      case Provider.GEMINI:
        this.provider = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
        });
        break;
      default:
        throw new Error(`Provider ${this.providerType} não é suportado`);
    }
  }

  getProvider<T>(): T {
    return this.provider as T;
  }

  getProviderType(): Provider {
    return this.providerType;
  }

  switchProvider(newProvider: Provider): void {
    this.providerType = newProvider;
    this.initializeProvider();
  }
}
