import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Glimora API')
    .setDescription('Commercial Authority Intelligence Platform API')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('users', 'User management')
    .addTag('organizations', 'Organization management')
    .addTag('accounts', 'Account Radar - monitored accounts')
    .addTag('decisors', 'Deal Intelligence - decision makers')
    .addTag('signals', 'Sales Signal Score - social and media signals')
    .addTag('actions', 'Action Layer - suggested actions')
    .addTag('authority', 'Authority Engine - CEO content')
    .addTag('press', 'Press Signal Engine & Draft Generator')
    .addTag('jobs', 'Background jobs management')
    .addTag('billing', 'Stripe billing integration')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation: http://localhost:${port}/api`);
}
void bootstrap();
