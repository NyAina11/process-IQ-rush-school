import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './src/app.module';

export const config = {
    api: {
        bodyParser: false,
    },
};

let cachedApp: any;

export default async function handler(req: any, res: any) {
    // Ensure we always return JSON even on early errors
    const sendError = (status: number, message: string, detail?: any) => {
        return res.status(status).json({
            error: true,
            message,
            detail,
            path: req.url,
            timestamp: new Date().toISOString()
        });
    };

    try {
        if (!cachedApp) {
            console.log('[Vercel API] Starting NestJS bootstrap...');
            
            // Basic sanity checks
            if (!AppModule) {
                return sendError(500, 'AppModule is undefined. Check your imports.');
            }

            const app = await NestFactory.create(AppModule, {
                logger: ['error', 'warn', 'log', 'debug'],
            });

            app.setGlobalPrefix('api');
            app.enableCors();
            app.useGlobalPipes(new ValidationPipe({
                whitelist: true,
                forbidNonWhitelisted: true,
                transform: true,
            }));

            await app.init();
            cachedApp = app.getHttpAdapter().getInstance();
            console.log('[Vercel API] NestJS bootstrap complete.');
        }

        return cachedApp(req, res);
    } catch (error: any) {
        console.error('[Vercel API] Critical Bootstrap Error:', error);
        return sendError(500, 'NestJS Boot Failure', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
    }
}
