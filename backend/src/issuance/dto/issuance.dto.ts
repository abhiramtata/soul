import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested, IsIn } from 'class-validator';

export class attributesDto {
  @ApiProperty({ example: 'Name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'John Doe' })
  @IsNotEmpty()
  @IsString()
  value: string;
}

export class offerCredDto {
  @ApiProperty({ 
    required: true,
    enum: ['v1', 'v2'],
    example: 'v2'
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['v1', 'v2'])
  protocolVersion: 'v1' | 'v2';

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  connectionId: string;

  @ApiProperty({})
  @IsNotEmpty()
  @IsString()
  credentialDefinitionId: string;

  @ApiProperty({
    type: [attributesDto],
    example: [
      { name: 'Name', value: 'John Doe' },
      { name: 'Email ID', value: 'john.doe@example.com' },
      { name: 'Organisation Name', value: 'ACME Corporation' },
      { name: 'Organisation ID', value: 'ACME123' },
      { name: 'Role', value: 'Developer' }
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => attributesDto)
  attributes: attributesDto[];
}

export class credentialRecordIdDto {
  @IsString()
  @ApiProperty()
  @IsNotEmpty()
  credentialRecordId: string;
}


// import { ApiProperty } from '@nestjs/swagger';
// import { Type } from 'class-transformer';
// import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

// export class attributesDto {
//   @ApiProperty({ example: 'name' })
//   @IsNotEmpty()
//   @IsString()
//   name: string;

//   @ApiProperty({ example: 'John Doe' })
//   @IsNotEmpty()
//   @IsString()
//   value: string;
// }

// export class offerCredDto {
//   @ApiProperty({ required: true })
//   @IsString()
//   @IsNotEmpty()
//   protocolVersion: string = 'v1' as 'v1' | 'v2';

//   @ApiProperty()
//   @IsNotEmpty()
//   @IsString()
//   connectionId: string;

//   @ApiProperty({})
//   @IsNotEmpty()
//   @IsString()
//   credentialDefinitionId: string;

//   @ApiProperty({
//     type: [attributesDto],
//     example: [
//       { name: 'name', value: 'John Doe' },
//       { name: 'age', value: '25' },
//       { name: 'city', value: 'New York' },
//       { name: 'blood_group', value: 'O+ve' },
//     ],
//   })
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => attributesDto)
//   attributes: attributesDto[];
// }

// export class credentialRecordIdDto {
//   @IsString()
//   @ApiProperty()
//   @IsNotEmpty()
//   credentialRecordId: string;
// }
