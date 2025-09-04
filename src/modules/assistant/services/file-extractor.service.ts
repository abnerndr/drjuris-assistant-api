import { Injectable } from '@nestjs/common';
import * as mammoth from 'mammoth';
import * as pdfParse from 'pdf-parse';

@Injectable()
export class FileExtractorService {
  async extractTextFromFile(fileBuffer: Buffer, fileExtension: string): Promise<string> {
    try {
      switch (fileExtension.toLowerCase()) {
        case 'pdf':
          return await this.extractTextFromPdf(fileBuffer);

        case 'doc':
        case 'docx':
          return await this.extractTextFromDocx(fileBuffer);

        case 'txt':
          return await this.extractTextFromTxt(fileBuffer);

        default:
          throw new Error(`Formato não suportado: ${fileExtension}`);
      }
    } catch (error: any) {
      throw new Error(`Erro ao extrair texto: ${error.message}`);
    }
  }

  private async extractTextFromPdf(pdfBuffer: Buffer): Promise<string> {
    try {
      const pdfData = await pdfParse(pdfBuffer);
      return pdfData.text;
    } catch (error: any) {
      throw new Error(`Erro ao processar PDF: ${error.message}`);
    }
  }

  private async extractTextFromDocx(docxBuffer: Buffer): Promise<string> {
    try {
      const result = await mammoth.extractRawText({ buffer: docxBuffer });
      return result.value;
    } catch (error: any) {
      throw new Error(`Erro ao processar DOCX: ${error.message}`);
    }
  }

  private async extractTextFromTxt(txtBuffer: Buffer): Promise<string> {
    try {
      const encodings = ['utf-8', 'latin1', 'ascii'];

      for (const encoding of encodings) {
        try {
          return txtBuffer.toString(encoding as BufferEncoding);
        } catch {
          continue;
        }
      }

      throw new Error('Não foi possível determinar a codificação do arquivo de texto');
    } catch (error: any) {
      throw new Error(`Erro ao processar TXT: ${error.message}`);
    }
  }
}
