import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug'],
  });

  const globalPrefix = 'v1';
  app.setGlobalPrefix(globalPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: [
      'http://localhost:3332', // Web customer store
      'http://localhost:3333', // Admin portal
      'http://localhost:3334', // Ionic mobile preview
      'http://localhost:4200', // Backward compatibility
      'http://localhost:4201',
      'http://localhost:4202',
      'capacitor://localhost',
      'ionic://localhost',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Idempotency-Key',
    ],
  });

  // OpenAPI / Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Teepha Flowers & Fabrics — Core API')
    .setDescription(
      'Bespoke luxury commerce backend powering Teepha Flowers & Fabrics with personalized feed, marketing attribution, Paystack checkout, and AI fitting studio.',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('v1/docs', app, document, {
    customSiteTitle: 'Aether Commerce API Docs',
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT || 3331;
  await app.listen(port);

  Logger.log(
    `🚀 API Server running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(
    `📚 Interactive Swagger OpenAPI Documentation: http://localhost:${port}/v1/docs`,
  );
}

bootstrap();
