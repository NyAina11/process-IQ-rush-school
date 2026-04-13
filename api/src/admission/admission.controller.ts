import { 
    Controller, Get, Post, Patch, Body, Param, 
    HttpCode, HttpStatus 
} from '@nestjs/common';
import { AdmissionService } from './admission.service';

@Controller('admission')
export class AdmissionController {
    constructor(private readonly admissionService: AdmissionService) {}

    // --- CANDIDATES ---

    @Get('candidats')
    async getCandidats() {
        const data = await this.admissionService.findAllCandidates();
        return data;
    }

    @Get('candidats-with-documents')
    async getCandidatsWithDocs() {
        const data = await this.admissionService.findAllCandidates();
        return data; // In Mongo, docs are usually part of the record
    }

    @Get('candidats/:id')
    async getCandidat(@Param('id') id: string) {
        return this.admissionService.findCandidateById(id);
    }

    @Post('candidats')
    @HttpCode(HttpStatus.CREATED)
    async createCandidat(@Body() body: any) {
        return this.admissionService.createCandidate(body);
    }

    @Patch('candidats/:id')
    async updateCandidat(@Param('id') id: string, @Body() body: any) {
        return this.admissionService.updateCandidate(id, body);
    }

    // --- COMPANIES ---

    @Get('entreprises')
    async getEntreprises() {
        return this.admissionService.findAllCompanies();
    }

    @Get('entreprises/:id')
    async getEntreprise(@Param('id') id: string) {
        return this.admissionService.findCompanyById(id);
    }

    @Post('entreprise') // Note: frontend sometimes uses 'entreprise' singular for POST
    @HttpCode(HttpStatus.CREATED)
    async createEntreprise(@Body() body: any) {
        return this.admissionService.createCompany(body);
    }

    @Post('entreprises')
    @HttpCode(HttpStatus.CREATED)
    async createEntreprises(@Body() body: any) {
        return this.admissionService.createCompany(body);
    }
}
