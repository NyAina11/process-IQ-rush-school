import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdmissionController } from './admission.controller';
import { AdmissionService } from './admission.service';
import { Candidate, CandidateSchema } from './schemas/candidate.schema';
import { Company, CompanySchema } from './schemas/company.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Candidate.name, schema: CandidateSchema },
            { name: Company.name, schema: CompanySchema },
        ]),
    ],
    controllers: [AdmissionController],
    providers: [AdmissionService],
    exports: [AdmissionService],
})
export class AdmissionModule {}
