import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuração do CORS
  app.enableCors();

  // Configuração da validação global
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Configuração do Swagger
  const config = new DocumentBuilder()
    .setTitle('DrJuris Assistant API')
    .setDescription('API para análise de processos trabalhistas usando IA')
    .setVersion('1.0')
    .addTag('Process Analysis')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 8000;
  await app.listen(port);
  
  console.log(`Servidor rodando na porta ${port}`);
  console.log(`Documentação da API disponível em http://localhost:${port}/api-docs`);
}

bootstrap();
