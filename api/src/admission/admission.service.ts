import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Candidate, CandidateDocument } from './schemas/candidate.schema';
import { Company, CompanyDocument } from './schemas/company.schema';

@Injectable()
export class AdmissionService {
    constructor(
        @InjectModel(Candidate.name) private candidateModel: Model<CandidateDocument>,
        @InjectModel(Company.name) private companyModel: Model<CompanyDocument>,
    ) {}

    // --- CANDIDATES ---

    async findAllCandidates(): Promise<CandidateDocument[]> {
        return this.candidateModel.find().sort({ createdAt: -1 }).exec();
    }

    async findCandidateById(id: string): Promise<CandidateDocument> {
        const candidate = await this.candidateModel.findById(id).exec();
        if (!candidate) throw new NotFoundException('Candidat introuvable');
        return candidate;
    }

    async createCandidate(data: any): Promise<CandidateDocument> {
        const created = new this.candidateModel(data);
        return created.save();
    }

    async updateCandidate(id: string, data: any): Promise<CandidateDocument> {
        return this.candidateModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    // --- COMPANIES ---

    async findAllCompanies(): Promise<CompanyDocument[]> {
        return this.companyModel.find().sort({ createdAt: -1 }).exec();
    }

    async findCompanyById(id: string): Promise<CompanyDocument> {
        const company = await this.companyModel.findById(id).exec();
        if (!company) throw new NotFoundException('Entreprise introuvable');
        return company;
    }

    async createCompany(data: any): Promise<CompanyDocument> {
        const created = new this.companyModel(data);
        return created.save();
    }

    async updateCompany(id: string, data: any): Promise<CompanyDocument> {
        return this.companyModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }
}
