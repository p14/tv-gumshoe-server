import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function main() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: [process.env.CLIENT_URL],
        methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
        credentials: true,
    });
    await app.listen(8080);
}

main();
