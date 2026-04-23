import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CompanyDocument = Company & Document;

@Schema({ 
    timestamps: true, 
    collection: 'entreprises',
    strict: false 
})
export class Company {
    @Prop({ required: true })
    raison_sociale: string;

    @Prop()
    siret: string;

    @Prop()
    email: string;

    @Prop()
    telephone: string;

    @Prop()
    ville: string;

    @Prop()
    code_postal: string;

    @Prop()
    id_etudiant: string;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
