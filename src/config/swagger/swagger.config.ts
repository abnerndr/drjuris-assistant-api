import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export class SwaggerConfig {
    static initialize<T>(app: INestApplication<T>) {
        const config = new DocumentBuilder()
        .setTitle('DrJuris Assistant API')
        .setDescription('API para análise de processos trabalhistas usando IA')
        .setVersion('1.0')
        .addTag('Process Analysis')
        .build();
    
      const document = SwaggerModule.createDocument(app, config);
      SwaggerModule.setup('api-docs', app, document);
    }
}