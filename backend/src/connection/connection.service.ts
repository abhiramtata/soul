import { Injectable, HttpStatus, BadRequestException,Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { OutOfBandInvitation } from '@credo-ts/core';
import { AcmeAgentService } from 'src/acme-agent/acme-agent.service';
import { agentType, oobIdDto } from './dto/connection.dto';
import { BobAgentService } from 'src/bob-agent/bob-agent.service';

@Injectable()
export class ConnectionService {

  private readonly logger = new Logger(ConnectionService.name);

  constructor(
    private readonly acmeService: AcmeAgentService,
    private readonly bobService: BobAgentService,
    

  ) {}  

  async createInvitation() {

    try{

      const agent = this.acmeService.getAgent();
      const outOfBandRecord = await agent.oob.createInvitation();

      const oobId = outOfBandRecord.id;
      const invitationUrl = outOfBandRecord.outOfBandInvitation.toUrl({
        domain: 'http://localhost:3002',
      });

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Invitation created successfully.',
        invitationUrl,
        oobId,
      };

    } catch(error){
      this.logger.error('Error creating invitation:', error);
      if (error instanceof NotFoundException)
      throw error;
    }
    
  }
  

  async receiveInvitation(invitationUrl: string) {
  try {
    const agent = this.bobService.getAgent();
    
    if (typeof invitationUrl !== 'string') {
      throw new BadRequestException('Invitation URL must be a string');
    }

    // Parse the invitation URL
    const invitation = OutOfBandInvitation.fromUrl(invitationUrl);
    
    // Receive the invitation
    const { outOfBandRecord, connectionRecord } = await agent.oob.receiveInvitation(invitation);

     // Check if connectionRecord is undefined
    if (!connectionRecord) {
      throw new BadRequestException('Failed to create connection from invitation');
    }

    // Wait for connection to be established
    const connectedConnection = await agent.connections.returnWhenIsConnected(connectionRecord.id);

    return {
      statusCode: HttpStatus.OK, // Changed from ACCEPTED to OK for GET request
      message: 'Invitation accepted successfully',
      connectionId: connectedConnection.id,
      outOfBandId: outOfBandRecord.id,
    };
  } catch (error) {
    this.logger.error('Error receiving invitation:', error);
    if (error instanceof NotFoundException || error instanceof BadRequestException) {
      throw error;
    }
    throw new InternalServerErrorException('Failed to receive invitation');
  }
}

  async getConnectionId(oobId: string) {

    try {
      const agent = this.acmeService.getAgent();
      
      const connections = await agent.connections.findAllByOutOfBandId(oobId);
      if (!connections.length) {
        throw new BadRequestException(`No connection found for oobId: ${oobId}`);
      }

      const connectedConnection = await agent.connections.returnWhenIsConnected(connections[0].id);

      return {
        statusCode: HttpStatus.OK,
        message: 'Connection ID returned successfully',
        connectionId: connectedConnection.id,
      };

    } catch (error) {
      this.logger.error('Error getting connection ID:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get connection ID');
    }

  }

  async getAllConnections(agentName: agentType) {

    try {
      let agent;

      if (agentName === agentType.ACME) {
        agent = this.acmeService.getAgent();
      } else if (agentName === agentType.BOB) {
        agent = this.bobService.getAgent();
      } else {
        throw new BadRequestException('Invalid agent type');
      }

      const connections = await agent.connections.getAll();
      
      return {
        statusCode: HttpStatus.OK,
        message: 'Connections retrieved successfully',
        data: connections.map(conn => ({
          id: conn.id,
          state: conn.state,
          theirLabel: conn.theirLabel,
          createdAt: conn.createdAt,
        })),
      };

    } catch (error) {
      this.logger.error('Error getting connections:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to get connections');
    }
  }



}