import { IsString, IsOptional, IsDateString } from 'class-validator';

export class CreateBugDto {
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    module?: string;

    @IsOptional()
    @IsString()
    priority?: string;

    @IsOptional()
    @IsString()
    reporterRole?: string;

    @IsOptional()
    @IsString()
    reporterName?: string;

    @IsOptional()
    @IsString()
    reporterEmail?: string;

    @IsOptional()
    @IsString()
    pagePath?: string;

    @IsOptional()
    @IsString()
    screenshotUrl?: string;

    @IsOptional()
    @IsString()
    assignee?: string;

    @IsOptional()
    @IsDateString()
    deadline?: string;
}

export class UpdateBugDto extends CreateBugDto {
    @IsOptional()
    @IsString()
    status?: string;
}

export class UpdateBugStatusDto {
    @IsString()
    status: string;

    @IsOptional()
    @IsString()
    requesterRole?: string;
}
