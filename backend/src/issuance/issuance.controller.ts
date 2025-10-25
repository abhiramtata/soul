import { Body, Controller, Post, Get,Query } from '@nestjs/common';
import { ApiQuery,ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IssuanceService } from './issuance.service';
import { credentialRecordIdDto, offerCredDto } from './dto/issuance.dto';

@Controller('issuance')
export class IssuanceController {
  constructor(private readonly issuanceService: IssuanceService) {}

    @Post('offer-cred')
    @ApiOperation({ summary: 'Issue the credential by Acme agent as issuer.' })
    @ApiResponse({ status: 201, description: 'Credential offered successfully.' })
    @ApiResponse({ status: 404, description: 'Acme agent is not initialized.' })
    @ApiResponse({ status: 400, description: 'Invalid inputs.' })
    @ApiResponse({ status: 500, description: 'Internal server error while offering credentials.' })
    async issueCredential(@Body() data: offerCredDto) {
      const result = await this.issuanceService.OfferCredential(data);
      return result;
    }

    @Post('accept-cred')
    @ApiOperation({ summary: 'Accept the offer by Bob agent as holder.' })
    @ApiResponse({ status: 202, description: 'Accepted the offer successfully.' })
    @ApiResponse({ status: 404, description: 'Bob agent is not initialized.' })
    @ApiResponse({ status: 500, description: 'Internal server error while accepting credentials.' })
    async getCredential(@Body() credentialRecordId: credentialRecordIdDto) {
      const result =
        await this.issuanceService.acceptCredential(credentialRecordId);
      return result;
    }

    @Get('credentials')
    @ApiOperation({ summary: 'Get all credential records for an agent.' })
    @ApiQuery({ name: 'agent', enum: ['acme', 'bob'], example: 'acme' })
    @ApiResponse({ status: 200, description: 'Credential records retrieved successfully.' })
    @ApiResponse({ status: 500, description: 'Internal server error while getting credentials.' })
    async getCredentialRecords(@Query('agent') agent: 'acme' | 'bob') {
      const result = await this.issuanceService.getCredentialRecords(agent);
      return result;
    }

      @Get('bob-credentials')
      @ApiOperation({ summary: 'Get all credential records for Bob agent' })
      async getBobCredentialRecords() {
          const result = await this.issuanceService.getBobCredentialRecords();
          return result;
      }

      @Post('accept-cred-bob')
      @ApiOperation({ summary: 'Accept credential using Bob agent record ID' })
      async acceptCredentialByBobRecord(@Body() credentialRecordId: credentialRecordIdDto) {
          const result = await this.issuanceService.acceptCredentialByBobRecord(credentialRecordId);
          return result;
      }

      @Post('auto-accept-cred')
      @ApiOperation({ summary: 'Auto-accept the first available credential offer' })
      async autoAcceptCredential() {
          const result = await this.issuanceService.autoAcceptCredential();
          return result;
      }

}
