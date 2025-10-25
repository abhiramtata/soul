import { Controller, Post, Get, Query } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { oobIdDto, agentType } from './dto/connection.dto';

@Controller('connection')
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post('create-invitation')
  @ApiOperation({ summary: 'Create a connection invitation by Acme agent.' })
  @ApiResponse({ status: 201, description: 'Invitation created successfully.' })
  @ApiResponse({
    status: 404,
    description: 'Acme agent is not initialized.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal serve error while creating invitation.',
  })
  async createInvitation() {
    const result = await this.connectionService.createInvitation();
    return result;
  }
  

  @Get('receive-invitation-bob')
  @ApiOperation({summary:'Accept a connection invitation by Bob agent.'})
  @ApiQuery({ 
    name: 'invitationUrl', 
    type: String, 
    description: 'The invitation URL received from ACME agent',
    example: 'http://localhost:3002?oob=eyJ0eXBlIjoiaHR0cHM6Ly9kaWRjb21tLm9yZy9vdXQtb2YtYmFuZC8yLjAvaW52aXRhdGlvbiJ9...'
  })
  @ApiResponse({
    status: 201,
    description: 'Invitation accepted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Bob agent is not initialized.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal serve error while receiving invitation.',
  })
  async receiveInvitation(@Query('invitationUrl') invitationUrl: string){
    const result = await this.connectionService.receiveInvitation(invitationUrl);
    return result;
  }


  @Get('connection-id')
  @ApiOperation({ summary: 'Get connection ID by out-of-band ID.' })
  @ApiQuery({ name: 'oobId', type: String, example: '12345678-1234-1234-1234-123456789012' })
  @ApiResponse({ status: 200, description: 'Connection ID returned successfully.' })
  @ApiResponse({ status: 404, description: 'Acme agent is not initialized.' })
  @ApiResponse({ status: 400, description: 'No connection found for the given out-of-band ID.' })
  @ApiResponse({ status: 500, description: 'Internal server error while returning ID.' })
  async getConnectionId(@Query('oobId') oobId: string) {
    return this.connectionService.getConnectionId(oobId);
  }


  @Get('connections')
  @ApiOperation({ summary: 'Get all connections for an agent.' })
  @ApiQuery({ name: 'agent', enum: agentType, example: agentType.ACME })
  @ApiResponse({ status: 200, description: 'Connections retrieved successfully.' })
  @ApiResponse({ status: 400, description: 'Invalid agent type.' })
  @ApiResponse({ status: 404, description: 'Agent is not initialized.' })
  @ApiResponse({ status: 500, description: 'Internal server error while getting connections.' })
  async getConnections(@Query('agent') agent: agentType) {
    return this.connectionService.getAllConnections(agent);
  }

}