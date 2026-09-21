import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateFolderDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @IsNotEmpty()
  name!: string;
}
