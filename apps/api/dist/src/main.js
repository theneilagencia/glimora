"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        rawBody: true,
    });
    app.enableCors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    const config = new swagger_1.DocumentBuilder()
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
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('api', app, document);
    const port = process.env.PORT ?? 3001;
    await app.listen(port);
    console.log(`Application is running on: http://localhost:${port}`);
    console.log(`Swagger documentation: http://localhost:${port}/api`);
}
void bootstrap();
//# sourceMappingURL=main.js.map