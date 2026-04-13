import {
    Controller, Get, Post, Patch, Delete,
    Body, Param, Query, HttpCode, HttpStatus,
    UploadedFile, UseInterceptors, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SupportService } from './support.service';
import { CreateBugDto, UpdateBugDto, UpdateBugStatusDto } from './bug.dto';

@Controller('support')
export class SupportController {
    constructor(private readonly supportService: SupportService) {}

    // ── POST /api/support/bugs ──────────────────────────────────────────
    @Post('bugs')
    @HttpCode(HttpStatus.CREATED)
    async createBug(@Body() body: CreateBugDto) {
        if (!body.title?.trim()) {
            throw new BadRequestException('Le titre est requis');
        }
        const bug = await this.supportService.create(body);
        return { success: true, data: bug };
    }

    // ── GET /api/support/bugs ───────────────────────────────────────────
    @Get('bugs')
    async getBugs(@Query() query: {
        status?: string;
        module?: string;
        priority?: string;
        search?: string;
        scope?: string;
        reporterEmail?: string;
        reporterRole?: string;
        requesterRole?: string;
    }) {
        const result = await this.supportService.findAll(query);
        return result;
    }

    // ── PATCH /api/support/bugs/:id/status ─────────────────────────────
    @Patch('bugs/:id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body() body: UpdateBugStatusDto,
    ) {
        const bug = await this.supportService.updateStatus(id, body.status);
        if (!bug) throw new BadRequestException('Ticket introuvable');
        return { success: true, data: bug };
    }

    // ── PATCH /api/support/bugs/:id ─────────────────────────────────────
    @Patch('bugs/:id')
    async updateBug(
        @Param('id') id: string,
        @Body() body: UpdateBugDto,
    ) {
        const bug = await this.supportService.update(id, body);
        if (!bug) throw new BadRequestException('Ticket introuvable');
        return { success: true, data: bug };
    }

    // ── DELETE /api/support/bugs/:id ────────────────────────────────────
    @Delete('bugs/:id')
    @HttpCode(HttpStatus.OK)
    async deleteBug(@Param('id') id: string) {
        const ok = await this.supportService.remove(id);
        if (!ok) throw new BadRequestException('Ticket introuvable');
        return { success: true };
    }

    // ── POST /api/support/bugs/upload-screenshot ─────────────────────────
    @Post('bugs/upload-screenshot')
    @UseInterceptors(FileInterceptor('file'))
    async uploadScreenshot(@UploadedFile() file: any) {
        if (!file) throw new BadRequestException('Fichier requis');
        const screenshotUrl = await this.supportService.uploadScreenshot(file);
        return { success: true, data: { screenshotUrl } };
    }
}
