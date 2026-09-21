import { IsString, Matches, IsOptional, Length } from 'class-validator';

export class CreateKnowledgeBaseDto {
  @IsString()
  @IsOptional()
  @Length(3, 100)
  @Matches(/^[A-Za-z0-9\s-]+$/, {
    message: 'Description contains invalid characters',
  })
  description?: string;
}
