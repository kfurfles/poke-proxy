import './otel';

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import helmet from 'helmet';
import { ENV } from './config/env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Pokemon API')
    .setDescription('Proxy API for PokeAPI - listing and searching Pokémon')
    .setVersion('1.0')
    .addTag('pokemon', 'Pokémon-related endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(ENV.PORT, '0.0.0.0');

   const url = await app.getUrl();
  const swaggerLink = `Swagger link: ${url}/api/docs`;
  const border = '='.repeat(swaggerLink.length);
  console.log(`\x1b[33m${border}\x1b[0m`);
  console.log(`\x1b[31mSwagger link:\x1b[0m \x1b[33m${url}/api/docs\x1b[0m`);
  console.log(`\x1b[33m${border}\x1b[0m`);
}
void bootstrap();
