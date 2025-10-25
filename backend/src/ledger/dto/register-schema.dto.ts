import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsNotEmpty } from 'class-validator';

export class RegisterSchemaDto {
  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  issuerId: string;
}
