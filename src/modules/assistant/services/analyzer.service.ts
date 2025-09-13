import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { Provider } from 'src/shared/enums/provider';
import { AnalysisProblemDto } from '../dto/process.dto';
import { ProviderService } from './provider.service';

@Injectable()
export class AnalyzerService {
  private readonly maxCharacters: number;
  private readonly content =
    'Você é um especialista em direito trabalhista brasileiro. Um advogado experiente e versado na lei';

  constructor(
    private configService: ConfigService,
    private providerService: ProviderService,
  ) {
    this.maxCharacters =
      Number(this.configService.get('MAX_TEXT_LENGTH')) || 6000;
  }

  async analyze(
    text: string,
    instructions?: string,
    useBasic?: boolean,
  ): Promise<{
    error?: string;
    rawText?: string;
    analysis?: AnalysisProblemDto[];
  }> {
    try {
      if (useBasic) {
        // Para análise básica, usar Gemini
        this.providerService.switchProvider(Provider.GEMINI);
        return await this.analyzeBasic(text, instructions);
      } else {
        // Para análise avançada, usar OpenAI
        this.providerService.switchProvider(Provider.OPENAI);
        return await this.advanced(text, instructions);
      }
    } catch (error) {
      console.error(
        'Erro na análise, tentando análise básica com Gemini:',
        error,
      );
      this.providerService.switchProvider(Provider.GEMINI);
      return await this.analyzeBasic(text, instructions);
    }
  }

  private async advanced(
    text: string,
    instructions?: string,
  ): Promise<{
    error?: string;
    rawText?: string;
    analysis?: AnalysisProblemDto[];
  }> {
    let truncatedText = text;
    if (text.length > this.maxCharacters) {
      const halfLength = Math.floor(this.maxCharacters / 2);
      const firstPart = text.slice(0, halfLength);
      const lastPart = text.slice(-halfLength);
      truncatedText = `${firstPart}\n\n[...texto truncado para análise...]\n\n${lastPart}`;
    }

    const relevantLaws = await this.getRelevantLegalInfo(
      truncatedText.slice(0, 500),
      false,
    );
    const prompt = this.advancedPrompt(
      relevantLaws,
      truncatedText,
      instructions,
    );

    const providerInstance = this.providerService.getProvider<OpenAI>();
    const promptResponse = await providerInstance.chat.completions.create({
      model: 'gpt-3.5-turbo-16k',
      messages: [
        { role: 'system', content: this.content },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
    });

    const messageContent = promptResponse.choices?.[0]?.message?.content;
    const analysisText = messageContent ? messageContent.trim() : '';

    const jsonStart = analysisText.indexOf('[');
    const jsonEnd = analysisText.lastIndexOf(']') + 1;

    if (jsonStart >= 0 && jsonEnd > jsonStart) {
      const jsonStr = analysisText.slice(jsonStart, jsonEnd);
      try {
        const parsedJson: { analysis: AnalysisProblemDto[] } =
          JSON.parse(jsonStr);
        return parsedJson;
      } catch (e) {
        console.log('JSON inválido recebido, retornando texto completo');
        return { error: 'JSON inválido', rawText: analysisText };
      }
    }
    return { error: 'JSON não encontrado', rawText: analysisText };
  }

  private async analyzeBasic(
    processText: string,
    additionalInstructions?: string,
  ): Promise<{
    error?: string;
    rawText?: string;
    analysis?: AnalysisProblemDto[];
  }> {
    const basicPrompt = this.basicPrompt(processText, additionalInstructions);

    try {
      const providerInstance = this.providerService.getProvider<OpenAI>();
      const promptResponse = await providerInstance.chat.completions.create({
        model: 'gpt-3.5-turbo-16k',
        messages: [
          { role: 'system', content: this.content },
          { role: 'user', content: basicPrompt },
        ],
        temperature: 0.7,
      });

      const messageContent = promptResponse.choices?.[0]?.message?.content;
      const fallbackAnalysis = messageContent ? messageContent.trim() : '';

      const jsonStart = fallbackAnalysis.indexOf('[');
      const jsonEnd = fallbackAnalysis.lastIndexOf(']') + 1;

      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        const jsonStr = fallbackAnalysis.slice(jsonStart, jsonEnd);
        try {
          const parsedJson: { analysis: AnalysisProblemDto[] } =
            JSON.parse(jsonStr);
          return parsedJson;
        } catch {
          return { error: 'JSON inválido', rawText: fallbackAnalysis };
        }
      }

      return { error: 'JSON não encontrado', rawText: fallbackAnalysis };
    } catch (fallbackError) {
      throw new Error(`Falha na análise: ${fallbackError}`);
    }
  }

  private async getRelevantLegalInfo(
    query: string,
    basic: boolean,
  ): Promise<string> {
    try {
      const prompt = `
        Você é um especialista em direito trabalhista brasileiro.
        Com base na consulta abaixo, liste as 3 leis ou precedentes mais relevantes da CLT:

        ${query.slice(0, 500)}
        
        Responda apenas com os artigos e precedentes relevantes, sem comentários adicionais.
      `;

      // Para getRelevantLegalInfo, sempre usar OpenAI para consistência
      // O provider já foi definido no método analyze principal
      const providerInstance = this.providerService.getProvider<OpenAI>();
      const promptResponse = await providerInstance.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: this.content },
          { role: 'user', content: prompt },
        ],
        temperature: 0.3,
      });

      const messageContent = promptResponse.choices?.[0]?.message?.content;
      return messageContent
        ? messageContent.trim()
        : 'Não foi possível recuperar leis relevantes.';
    } catch (error) {
      console.error('Erro ao buscar informações legais relevantes:', error);
      return 'Não foi possível recuperar leis relevantes.';
    }
  }

  private advancedPrompt(
    laws: string,
    text: string,
    instructions?: string,
  ): string {
    return `
      Você é um especialista em direito trabalhista brasileiro, com profundo conhecimento da CLT e jurisprudência do TST.
      Use as seguintes leis e precedentes relevantes para informar sua análise:
      ${laws}
      Analise o processo a seguir e identifique todos os problemas e inconsistências:
      ${text}
      Forneça sua análise em formato JSON válido, seguindo exatamente esta estrutura como referência:
      [
        {
          "problema": "Descrição completa do problema 1",
          "tipo": "processual/contradição/fundamentação/prazo",
          "gravidade": "alta/média/baixa",
          "analise": "Análise detalhada do problema",
          "recomendacao": "Recomendação específica para resolver este problema",
          "precedentes": ["Precedente 1", "Precedente 2"]
        }
      ]
      Use linguagem técnica jurídica apropriada, mas garanta que o formato JSON seja exatamente como especificado acima e seja válido.
      
      ${instructions ? instructions : ''}
    `;
  }

  private basicPrompt(text: string, instructions?: string): string {
    return `
      Você é um especialista em direito trabalhista brasileiro, com profundo conhecimento da CLT e jurisprudência do TST.
      Analise o processo a seguir e identifique todos os problemas e inconsistências:
      ${text.length > 6000 ? text.slice(0, 6000) + '...' : text}
      Forneça sua análise em formato JSON válido, seguindo exatamente esta estrutura como referência:
      [
        {
          "problema": "Descrição completa do problema 1",
          "tipo": "processual/contradição/fundamentação/prazo",
          "gravidade": "alta/média/baixa",
          "analise": "Análise detalhada do problema",
          "recomendacao": "Recomendação específica para resolver este problema",
          "precedentes": ["Precedente 1", "Precedente 2"]
        }
      ]
      Use linguagem técnica jurídica apropriada, mas garanta que o formato JSON seja exatamente como especificado acima e seja válido.
      ${instructions ? instructions : ''}
    `;
  }
}
