import { Injectable, Logger } from '@nestjs/common';
import * as mammoth from 'mammoth';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class FileExtractorService {
  private readonly logger = new Logger(FileExtractorService.name);
  async extractTextFromFile(
    fileBuffer: Buffer,
    fileExtension: string,
  ): Promise<string> {
    if (!fileBuffer) {
      throw new Error('Buffer do arquivo é inválido');
    }

    if (!fileExtension) {
      throw new Error('Extensão do arquivo não fornecida');
    }

    // Permite buffers vazios - retorna string vazia
    if (fileBuffer.length === 0) {
      return '';
    }

    const normalizedExtension = fileExtension.toLowerCase().replace('.', '');
    this.logger.log(`Extraindo texto de arquivo ${normalizedExtension}`);

    try {
      switch (normalizedExtension) {
        case 'pdf':
          return await this.extractTextFromPdf(fileBuffer);

        case 'doc':
        case 'docx':
          return await this.extractTextFromDocx(fileBuffer);

        case 'txt':
          return this.extractTextFromTxt(fileBuffer);

        default:
          throw new Error(`Formato não suportado: ${fileExtension}`);
      }
    } catch (error: any) {
      this.logger.error(
        `Erro ao extrair texto do arquivo ${normalizedExtension}: ${error.message}`,
      );
      throw new Error(`Erro ao extrair texto: ${error.message}`);
    }
  }

  private async extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
    try {
      const pdfData = await pdfParse(pdfBuffer);
      const extractedText = pdfData.text?.trim() || '';
      if (!extractedText) {
        this.logger.warn('PDF processado mas nenhum texto foi extraído');
        return '';
      }
      return extractedText;
    } catch (error: any) {
      throw new Error(`Erro ao processar PDF: ${error.message}`);
    }
  }

  private async extractTextFromDocx(docxBuffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer: docxBuffer });
      const extractedText = result.value?.trim() || '';

      if (!extractedText) {
        this.logger.warn('DOCX processado mas nenhum texto foi extraído');
        return '';
      }

      return extractedText;
    } catch (error: any) {
      throw new Error(`Erro ao processar DOCX: ${error.message}`);
    }
  }

  private extractTextFromTxt(txtBuffer: Buffer): string {
    try {
      const encodings: BufferEncoding[] = ['utf-8', 'latin1', 'ascii'];
      let lastError: Error | null = null;

      for (const encoding of encodings) {
        try {
          const text = txtBuffer.toString(encoding);
          // Verifica se o texto contém caracteres de controle inválidos
          if (this.isValidText(text)) {
            return text;
          }
        } catch (error) {
          lastError = error as Error;
          continue;
        }
      }
      throw new Error(
        `Não foi possível determinar a codificação do arquivo de texto. Último erro: ${lastError?.message || 'Desconhecido'}`,
      );
    } catch (error: any) {
      throw new Error(`Erro ao processar TXT: ${error.message}`);
    }
  }

  /**
   * Verifica se o texto extraído é válido (não contém muitos caracteres de controle)
   */
  private isValidText(text: string): boolean {
    if (!text) return true;

    // Conta caracteres de controle (exceto quebras de linha, tabs e carriage return)
    // eslint-disable-next-line no-control-regex
    const controlChars = text.match(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g);
    const controlCharCount = controlChars ? controlChars.length : 0;

    // Se mais de 5% do texto são caracteres de controle, considera inválido
    return controlCharCount / text.length < 0.05;
  }
}
