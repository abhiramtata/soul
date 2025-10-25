import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class didGenerateDto {
  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  method: string;

  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  namespace: string;

  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  did: string;

  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  seed: string;
}