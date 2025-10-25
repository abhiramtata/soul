import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { agentType } from 'src/connection/dto/connection.dto';

export class requestProofIdDto {
  @ApiProperty({})
  @IsString()
  @IsNotEmpty()
  connectionId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  credentialDefId: string;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // schemaId: string;
}

export class getproofRecordsDto {
  @ApiProperty({ enum: agentType })
  @IsEnum(agentType)
  agent: agentType;
}

export class getproofRecordsbyThreadDto {
  @ApiProperty({ enum: agentType })
  @IsEnum(agentType)
  agent: agentType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  threadId: string;
}

export class proofRequestIdDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  proofRecordId: string;
}
