import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';

export enum agentType {
  ACME = 'acme',
  BOB = 'bob',
}

export class getRecordsDto {
  @ApiProperty({ enum: agentType })
  @IsEnum(agentType)
  agent: agentType;
}

export class getCredByIdDto {
  @ApiProperty({ enum: agentType })
  @IsEnum(agentType)
  agent: agentType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  credId: string;
}

export class getCredBythreadIdDto {
  @ApiProperty({ enum: agentType })
  @IsEnum(agentType)
  agent: agentType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  threadId: string;
}

export class credRecordIdDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  credentialRecordId: string;
}
