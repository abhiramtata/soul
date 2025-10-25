import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { VerificationService } from './verification.service';
import {
  getproofRecordsbyThreadDto,
  getproofRecordsDto,
  proofRequestIdDto,
  requestProofIdDto,
} from './dto /verification.dto';
import { agentType } from 'src/connection/dto/connection.dto';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller('verification')
@ApiTags('verification')
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Post('request-proof')
  @ApiOperation({ 
    summary: 'Request proof presentation from another agent',
    description: 'Acme agent requests proof of credentials from Bob agent using a connection'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Proof request sent successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid connection ID or credential definition ID' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Acme agent not initialized or connection not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error while requesting proof' 
  })
  async verificationRequest(@Body() data: requestProofIdDto) {
    const result = await this.verificationService.proofRequest(data);
    return result;
  }

  @Post('accept-present-proof')
  @ApiOperation({ 
    summary: 'Accept proof request and present proof',
    description: 'Bob agent accepts proof request and creates a proof presentation'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Proof presentation created and sent successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'No proof request found or invalid proof record ID' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Bob agent not initialized or proof record not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error while accepting proof request' 
  })
  async acceptRequest(@Body() Id: proofRequestIdDto) {
    return this.verificationService.acceptRequestandPresentproof(Id);
  }

  @Post('verify-proof')
  @ApiOperation({ 
    summary: 'Verify proof presentation',
    description: 'Acme agent verifies the proof presentation received from Bob agent'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Proof verified successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'No proof found for verification' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Acme agent not initialized or proof record not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error while verifying proof' 
  })
  async verifyProof(@Body() Id: proofRequestIdDto) {
    return this.verificationService.verifyCredential(Id);
  }

  @Get('all-proofrecords')
  @ApiOperation({ 
    summary: 'Get all proof records for an agent',
    description: 'Retrieve all proof records (requests, presentations) for either Acme or Bob agent'
  })
  @ApiQuery({ 
    name: 'agent', 
    enum: agentType,
    description: 'The agent to get proof records for',
    example: agentType.ACME 
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Proof records retrieved successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid agent type' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Agent not initialized' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error while getting proof records' 
  })
  async getProofRecords(@Query() data: getproofRecordsDto) {
    return this.verificationService.getproofRecords(data.agent);
  }

  @Get('proofrecords-threadId')
  @ApiOperation({ 
    summary: 'Get proof records by thread ID',
    description: 'Retrieve proof records for an agent using the thread ID'
  })
  @ApiQuery({ 
    name: 'agent', 
    enum: agentType,
    description: 'The agent to get proof records for',
    example: agentType.ACME 
  })
  @ApiQuery({ 
    name: 'threadId', 
    type: String, 
    description: 'The thread ID to search for',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Proof records by thread retrieved successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Invalid agent type or thread ID' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Agent not initialized or no records found for thread ID' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error while getting proof records' 
  })
  async getProofRecordByThread(@Query() data: getproofRecordsbyThreadDto) {
    return this.verificationService.getproofRecordbyThread(data);
  }
}