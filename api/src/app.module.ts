import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SupportModule } from './support/support.module';
import { AdmissionModule } from './admission/admission.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => {
                const uri = configService.get<string>('MONGODB_URI');
                if (!uri) {
                    console.error('[AppModule] MONGODB_URI is not defined in environment variables!');
                }
                return {
                    uri: uri || 'mongodb://localhost:27017/unused',
                    dbName: configService.get<string>('DB_NAME') || 'processiq',
                    serverSelectionTimeoutMS: 5000, // 5 seconds timeout
                };
            },
            inject: [ConfigService],
        }),
        AuthModule,
        UsersModule,
        SupportModule,
        AdmissionModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
