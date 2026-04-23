import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CandidateDocument = Candidate & Document;

@Schema({ 
    timestamps: true, 
    collection: 'candidats', 
    strict: false 
})
export class Candidate {
    @Prop({ required: true })
    prenom: string;

    @Prop({ required: true })
    nom_naissance: string;

    @Prop()
    nom_usage: string;

    @Prop()
    email: string;

    @Prop()
    telephone: string;

    @Prop()
    date_naissance: string;

    @Prop()
    sexe: string;

    @Prop()
    nationalite: string;

    @Prop()
    formation_souhaitee: string;

    @Prop({ default: 'En attente' })
    validation: string;

    @Prop()
    id_entreprise: string;

    @Prop()
    entreprise_raison_sociale: string;

    // Additional fields can be stored due to strict: false
    // or we can define them explicitly as needed
}

export const CandidateSchema = SchemaFactory.createForClass(Candidate);
