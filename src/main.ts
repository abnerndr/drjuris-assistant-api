import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerConfig } from './config/swagger/swagger.config';

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
  SwaggerConfig.initialize(app)
  // 
  const port = process.env.PORT || 8000;
  await app.listen(port);
  Logger.debug(`Servidor rodando na porta ${port}`);
  Logger.debug(`Documentação da API disponível em http://localhost:${port}/api-docs`);


}

bootstrap();
