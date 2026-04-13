import { IsString, IsOptional, IsEnum, IsEmail, IsUrl, IsDateString } from 'class-validator';

export enum BugStatus {
  NEW = 'new',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
}

export enum BugPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum BugModule {
  ADMISSION = 'admission',
  RH = 'rh',
  COMMERCIAL = 'commercial',
  OTHER = 'other',
}

export class CreateBugDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BugModule)
  module?: BugModule;

  @IsOptional()
  @IsEnum(BugPriority)
  priority?: BugPriority;

  @IsOptional()
  @IsString()
  reporterName?: string;

  @IsOptional()
  @IsString()
  reporterEmail?: string;

  @IsOptional()
  @IsString()
  reporterRole?: string;

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

export class UpdateBugDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(BugStatus)
  status?: BugStatus;

  @IsOptional()
  @IsEnum(BugModule)
  module?: BugModule;

  @IsOptional()
  @IsEnum(BugPriority)
  priority?: BugPriority;

  @IsOptional()
  @IsUrl()
  screenshotUrl?: string;

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsDateString()
  deadline?: string;
}
