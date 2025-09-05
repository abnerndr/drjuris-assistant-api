import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { apiReference } from '@scalar/nestjs-api-reference';

export class SwaggerConfig {
  static initialize<T>(app: INestApplication<T>) {
    const config = new DocumentBuilder()
      .setTitle('DrJuris Assistant API')
      .setDescription('API para análise de processos trabalhistas usando IA')
      .setVersion('1.0')
      .addTag('Process Analysis')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);

    // Configuração do Swagger UI tradicional
    SwaggerModule.setup('api-docs', app, document);

    // Configuração do Scalar (interface mais bonita)
    app.use(
      '/api-reference',
      apiReference({
        content: document,
        theme: 'default', // Você pode usar: 'default', 'alternate', 'moon', 'purple', 'solarized'
      }),
    );
  }
}
