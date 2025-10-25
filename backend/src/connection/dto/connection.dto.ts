import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class oobIdDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  oobId: string;
}

export enum agentType {
  ACME = 'acme',
  BOB = 'bob'
}

export class getRecordsDto{
  @ApiProperty({enum: agentType})
  @IsEnum(agentType)
  agent: agentType
}


export class getRecordsByIdDto{
  @ApiProperty({enum:agentType})
  @IsEnum(agentType)
  agent: agentType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  credId: string

}



