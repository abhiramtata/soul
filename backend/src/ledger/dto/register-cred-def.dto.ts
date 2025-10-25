import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class RegisterCredDefDto {
    @ApiProperty({})
    @IsString()
    @IsNotEmpty()
    issuerId: string;

    @ApiProperty({})
    @IsString()
    @IsNotEmpty()
    schemaId: string;
}