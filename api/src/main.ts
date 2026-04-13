import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { join } from 'path';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.setGlobalPrefix('api'); // Add prefix for cleaner API calls
    app.enableCors(); // Enable CORS for frontend communication
    
    // Serve uploaded files securely
    app.useStaticAssets(join(process.cwd(), 'uploads'), {
      prefix: '/api/uploads/',
    });

    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`[Main] Application is running on: http://localhost:${port}/api`);
}
bootstrap();
