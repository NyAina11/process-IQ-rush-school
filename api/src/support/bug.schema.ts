import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BugDocument = Bug & Document;

@Schema({ timestamps: true })
export class Bug {
    @Prop({ required: true, trim: true })
    title: string;

    @Prop({ default: '' })
    description: string;

    @Prop({ enum: ['new', 'in_progress', 'resolved'], default: 'new' })
    status: string;

    @Prop({ enum: ['low', 'medium', 'high', 'critical'], default: 'medium' })
    priority: string;

    @Prop({ enum: ['admission', 'rh', 'commercial', 'other'], default: 'other' })
    module: string;

    @Prop({ default: '' })
    reporterRole: string;

    @Prop({ default: '' })
    reporterName: string;

    @Prop({ default: '' })
    reporterEmail: string;

    @Prop({ default: '' })
    pagePath: string;

    @Prop({ default: '' })
    screenshotUrl: string;
}

export const BugSchema = SchemaFactory.createForClass(Bug);
