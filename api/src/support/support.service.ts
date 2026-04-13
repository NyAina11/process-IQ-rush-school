import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Bug, BugDocument } from './bug.schema';

@Injectable()
export class SupportService {
    constructor(@InjectModel(Bug.name) private bugModel: Model<BugDocument>) {}

    async create(dto: Partial<Bug>): Promise<BugDocument> {
        const created = new this.bugModel(dto);
        return created.save();
    }

    async findAll(query: {
        status?: string;
        module?: string;
        priority?: string;
        search?: string;
        scope?: string;
        reporterEmail?: string;
        reporterRole?: string;
        requesterRole?: string;
    }): Promise<{ data: BugDocument[]; pagination: any }> {
        const filter: Record<string, any> = {};

        if (query.status) filter.status = query.status;
        if (query.module) filter.module = query.module;
        if (query.priority) filter.priority = query.priority;

        // Scope: if not admin, only show own tickets
        const isAdmin = ['super_admin', 'admin'].includes(query.requesterRole || '');
        if (!isAdmin && query.reporterEmail) {
            filter.reporterEmail = query.reporterEmail;
        }

        if (query.search) {
            filter.$or = [
                { title: { $regex: query.search, $options: 'i' } },
                { description: { $regex: query.search, $options: 'i' } },
            ];
        }

        const data = await this.bugModel.find(filter).sort({ createdAt: -1 }).exec();
        return { data, pagination: { total: data.length } };
    }

    async findOne(id: string): Promise<BugDocument | null> {
        return this.bugModel.findById(id).exec();
    }

    async updateStatus(id: string, status: string): Promise<BugDocument | null> {
        return this.bugModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
    }

    async update(id: string, dto: Partial<Bug>): Promise<BugDocument | null> {
        return this.bugModel.findByIdAndUpdate(id, dto, { new: true }).exec();
    }

    async remove(id: string): Promise<boolean> {
        const result = await this.bugModel.findByIdAndDelete(id).exec();
        return !!result;
    }

    async uploadScreenshot(_file: any): Promise<string> {
        // Placeholder: retourne une URL fictive en dev
        // En prod, intégrer un service de stockage (S3, Cloudinary, etc.)
        return `https://processiq.duckdns.org/uploads/screenshots/${Date.now()}-${_file?.originalname || 'screenshot'}`;
    }
}
