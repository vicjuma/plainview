import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1)
  similarityThreshold?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(2)
  openAiTemp?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  openAiHistory?: number;

  @IsOptional()
  @IsString()
  openAiPrompt?: string;

  @IsOptional()
  @IsString()
  queryRefusalResponse?: string;

  @IsOptional()
  @IsString()
  chatMode?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  topN?: number;
}
