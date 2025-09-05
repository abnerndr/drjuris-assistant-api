import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';
import { AppModule } from './app.module';
import { SwaggerConfig } from './config/swagger/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Configuração do CORS
  app.enableCors();
  // Configuração do Swagger
  SwaggerConfig.initialize(app);
  // Configuração de validação global
  app.useGlobalPipes(new ZodValidationPipe());
  //
  const port = process.env.PORT || 8000;
  await app.listen(port);
  Logger.debug(`Servidor rodando na porta ${port}`);
  Logger.debug(
    `Documentação da API disponível em http://localhost:${port}/api-docs`,
  );
  Logger.debug(
    `Documentação Scalar (interface moderna) disponível em http://localhost:${port}/api-reference`,
  );
}

bootstrap();
