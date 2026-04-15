import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { Bug, BugSchema } from './bug.schema';
import { SupportService } from './support.service';
import { SupportController } from './support.controller';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Bug.name, schema: BugSchema }]),
        MulterModule.register({
            dest: require('path').join(process.cwd(), 'uploads', 'screenshots'),
        }),
    ],
    controllers: [SupportController],
    providers: [SupportService],
    exports: [SupportService],
})
export class SupportModule {}
