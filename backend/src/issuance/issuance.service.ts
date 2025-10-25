import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { AutoAcceptCredential } from '@credo-ts/core';
import { AcmeAgentService } from 'src/acme-agent/acme-agent.service';
import { BobAgentService } from 'src/bob-agent/bob-agent.service';
import { credentialRecordIdDto, offerCredDto } from './dto/issuance.dto';

@Injectable()
export class IssuanceService {
  constructor(
    private readonly acmeService: AcmeAgentService,
    private readonly bobService: BobAgentService,
    private readonly logger: Logger,
  ) {}

  //offer credential
  async OfferCredential(data: offerCredDto): Promise<unknown> {
    try {
      const agent = this.acmeService.getAgent();

      this.logger.log('Starting credential offer...');
      this.logger.log('Connection ID:', data.connectionId);
      this.logger.log('Credential Definition ID:', data.credentialDefinitionId);
      this.logger.log('Attributes:', data.attributes);

      // Solution 1: Use type assertion with any to bypass the never type
      const offerOptions: any = {
        protocolVersion: data.protocolVersion,
        connectionId: data.connectionId,
        autoAcceptCredential: AutoAcceptCredential.Always,
        credentialFormats: {
          anoncreds: {
            credentialDefinitionId: data.credentialDefinitionId,
            attributes: data.attributes,
          },
        },
      };

      const CredentialExchangeRecord = await agent.credentials.offerCredential(offerOptions);

      this.logger.log('Credential offered successfully. Record ID:', CredentialExchangeRecord.id);

      if (!CredentialExchangeRecord) {
        throw new BadRequestException('Error in offering credential');
      }

      return {
        statusCode: HttpStatus.CREATED,
        message: 'Credential offered successfully',
        data: {
          credentialRecordId: CredentialExchangeRecord.id,
          state: CredentialExchangeRecord.state,
          connectionId: CredentialExchangeRecord.connectionId,
        },
      };

    } catch (error) {
      console.error('Error offering credential:', error);
      
      // Better error logging
      this.logger.error('Full error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new InternalServerErrorException('Error in offering the credential: ' + error.message);
    }
  }


  //accept credential
  async acceptCredential(id: credentialRecordIdDto): Promise<unknown> {
    try {
      const agent = this.bobService.getAgent();

      this.logger.log('Accepting credential offer:', id.credentialRecordId);

      const acceptedCredential = await agent.credentials.acceptOffer({
        credentialRecordId: id.credentialRecordId,
        autoAcceptCredential: AutoAcceptCredential.Always,
      });

      this.logger.log('Credential offer accepted successfully:', acceptedCredential.id);

      return {
        statusCode: HttpStatus.ACCEPTED,
        message: 'Credential offer accepted successfully',
        data: {
          credentialRecordId: acceptedCredential.id,
          state: acceptedCredential.state,
        },
      };
    } catch (error) {
      this.logger.error('Error accepting credential:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to accept credential: ' + error.message
      );
    }
  }

  // Get credential records for debugging
  async getCredentialRecords(agentType: 'acme' | 'bob') {
      try {
        let agent:any;

        if (agentType === 'acme') {
          agent = this.acmeService.getAgent();
        } else if (agentType === 'bob') {
          // Check if Bob agent is initialized before trying to get it
          try {
            agent = this.bobService.getAgent();
          } catch (error) {
            if (error instanceof NotFoundException) {
              this.logger.log('Bob agent not initialized, returning empty credentials array');
              return {
                statusCode: HttpStatus.OK,
                message: 'Bob agent not initialized',
                data: [],
              };
            }
            throw error;
          }
        } else {
          throw new BadRequestException('Invalid agent type');
        }
        
        const credentials = await agent.credentials.getAll();
        
        return {
          statusCode: HttpStatus.OK,
          message: 'Credential records retrieved successfully',
          data: credentials.map(cred => ({
            id: cred.id,
            state: cred.state,
            connectionId: cred.connectionId,
            protocolVersion: cred.protocolVersion,
            createdAt: cred.createdAt,
          })),
        };
      } catch (error) {
        this.logger.error('Error getting credential records:', error);
        
        // If Bob agent is not initialized, return empty array instead of error
        if (error instanceof NotFoundException && error.message.includes('Bob agent')) {
          return {
            statusCode: HttpStatus.OK,
            message: 'Bob agent not initialized',
            data: [],
          };
        }
        
        throw new InternalServerErrorException('Failed to get credential records: ' + error.message);
      }
    }




      // Get all credential records for Bob agent
      async getBobCredentialRecords(): Promise<unknown> {
        try {
          // Check if Bob agent is initialized
          const agent = this.bobService.getAgent();
          
          const credentials = await agent.credentials.getAll();
          
          // Filter to show only relevant states for debugging
          const relevantCredentials = credentials.filter(cred => 
              cred.state === 'offer-received' || 
              cred.state === 'request-sent' || 
              cred.state === 'credential-received'
          );

          return {
              statusCode: HttpStatus.OK,
              message: 'Bob credential records retrieved successfully',
              data: relevantCredentials.map(cred => ({
                  id: cred.id,
                  state: cred.state,
                  connectionId: cred.connectionId,
                  protocolVersion: cred.protocolVersion,
                  createdAt: cred.createdAt,
                  threadId: cred.threadId,
              })),
          };
        } catch (error) {
          this.logger.error('Error getting Bob credential records:', error);
          
          // If Bob agent is not initialized, return empty array
          if (error instanceof NotFoundException && error.message.includes('Bob agent')) {
            return {
              statusCode: HttpStatus.OK,
              message: 'Bob agent not initialized',
              data: [],
            };
          }
          
          throw new InternalServerErrorException('Failed to get Bob credential records: ' + error.message);
        }
      }

      // Accept credential using Bob's credential record ID
      async acceptCredentialByBobRecord(id: credentialRecordIdDto): Promise<unknown> {
          try {
              const agent = this.bobService.getAgent();

              this.logger.log('Accepting credential offer with Bob record ID:', id.credentialRecordId);

              // First verify the record exists in Bob's wallet
              const credentialRecord = await agent.credentials.getById(id.credentialRecordId);
              this.logger.log('Found credential record in Bob wallet:', credentialRecord.state);

              if (credentialRecord.state !== 'offer-received') {
                  throw new BadRequestException(`Credential is not in offer-received state. Current state: ${credentialRecord.state}`);
              }

              const acceptedCredential = await agent.credentials.acceptOffer({
                  credentialRecordId: id.credentialRecordId,
                  autoAcceptCredential: AutoAcceptCredential.Always,
              });

              this.logger.log('Credential offer accepted successfully:', acceptedCredential.id);
              this.logger.log('New credential state:', acceptedCredential.state);

              return {
                  statusCode: HttpStatus.ACCEPTED,
                  message: 'Credential offer accepted successfully',
                  data: {
                      credentialRecordId: acceptedCredential.id,
                      state: acceptedCredential.state,
                  },
              };
          } catch (error) {
              this.logger.error('Error accepting credential:', error);
              if (error instanceof NotFoundException || error instanceof BadRequestException) {
                  throw error;
              }
              throw new InternalServerErrorException('Failed to accept credential: ' + error.message);
          }
      }

    // Auto-accept the first available credential offer for Bob
    async autoAcceptCredential(): Promise<unknown> {
        try {
            const agent = this.bobService.getAgent();
            const credentials = await agent.credentials.getAll();
            
            // Find credential in offer-received state
            const credentialToAccept = credentials.find(cred => cred.state === 'offer-received');
            
            if (!credentialToAccept) {
                throw new BadRequestException('No pending credential offers found for Bob agent');
            }

            this.logger.log('Auto-accepting credential:', credentialToAccept.id);

            const acceptedCredential = await agent.credentials.acceptOffer({
                credentialRecordId: credentialToAccept.id,
                autoAcceptCredential: AutoAcceptCredential.Always,
            });

            return {
                statusCode: HttpStatus.ACCEPTED,
                message: 'Credential offer auto-accepted successfully',
                data: {
                    credentialRecordId: acceptedCredential.id,
                    state: acceptedCredential.state,
                    attributes: acceptedCredential.credentialAttributes,
                },
            };
        } catch (error) {
            this.logger.error('Error in auto-accept:', error);
            throw new InternalServerErrorException('Failed to auto-accept credential: ' + error.message);
        }

      }

}


// import {
//   BadRequestException,
//   HttpStatus,
//   Injectable,
//   InternalServerErrorException,
//   Logger,
//   NotFoundException,
// } from '@nestjs/common';
// import { AutoAcceptCredential } from '@credo-ts/core';
// import { AcmeAgentService } from 'src/acme-agent/acme-agent.service';
// import { BobAgentService } from 'src/bob-agent/bob-agent.service';
// import { credentialRecordIdDto, offerCredDto } from './dto/issuance.dto';

// export type protocolVersion = 'v1' | 'v2';
// @Injectable()
// export class IssuanceService {
//   constructor(
//     private readonly acmeService: AcmeAgentService,
//     private readonly bobService: BobAgentService,
//     private readonly logger: Logger,
//   ) {}

//   //offer credential
//   async OfferCredential(data: offerCredDto): Promise<unknown> {
//     try {
//       const agent = this.acmeService.getAgent();

//       this.logger.log('Starting credential offer...');
//       this.logger.log('Connection ID:', data.connectionId);
//       this.logger.log('Credential Definition ID:', data.credentialDefinitionId);
//       this.logger.log('Attributes:', data.attributes);

//       const CredentialExchangeRecord = await agent.credentials.offerCredential({
//         protocolVersion: data.protocolVersion as unknown as never,
//         connectionId: data.connectionId,
//         autoAcceptCredential: AutoAcceptCredential.Always,
//         credentialFormats: {
//           anoncreds: {
//             credentialDefinitionId: data.credentialDefinitionId,
//             attributes: data.attributes,
//           },
//         },
//       });

//       this.logger.log('Cred Record:', CredentialExchangeRecord, null, 2);

//       if (!CredentialExchangeRecord) {
//         throw new BadRequestException('Error in offering credential');
//       }

//       return {
//         statusCode: HttpStatus.OK,
//         message: 'Credential offered successfully',
//         data: CredentialExchangeRecord,
//       };

//     } catch (error) {

//       if (error instanceof NotFoundException) {
//         throw error;
//       }
//       if (error instanceof BadRequestException) {
//         throw error;
//       }
//       throw new InternalServerErrorException('Error in issuing the credential');
//     }
//   }

//   //accept credential
//   async acceptCredential(id: credentialRecordIdDto): Promise<unknown> {
//     try {
//       const agent = this.bobService.getAgent();

//       this.logger.log('Accepting credential offer:', id.credentialRecordId);

//       const acceptedCredential = await agent.credentials.acceptOffer({
//         credentialRecordId: id.credentialRecordId,
//         autoAcceptCredential: AutoAcceptCredential.Always,
//       });

//       this.logger.log('Credential offer accepted successfully:', acceptedCredential.id);

//       return {
//         statusCode: HttpStatus.ACCEPTED,
//         message: 'Credential offer accepted successfully',
//         data: {
//           credentialRecordId: acceptedCredential.id,
//           state: acceptedCredential.state,
//         },
//       };
//     } catch (error) {
//       if (error instanceof NotFoundException) {
//         throw error;
//       }
//       throw new InternalServerErrorException(
//         `Failed to accept credential: ${error}`,
//       );
//     }
//   }

//   // Get credential records for debugging
//   async getCredentialRecords(agentType: 'acme' | 'bob') {
//     try {
//       const agent = agentType === 'acme' ? this.acmeService.getAgent() : this.bobService.getAgent();
      
//       const credentials = await agent.credentials.getAll();
      
//       return {
//         statusCode: HttpStatus.OK,
//         message: 'Credential records retrieved successfully',
//         data: credentials.map(cred => ({
//           id: cred.id,
//           state: cred.state,
//           connectionId: cred.connectionId,
//           protocolVersion: cred.protocolVersion,
//           createdAt: cred.createdAt,
//         })),
//       };
//     } catch (error) {
//       this.logger.error('Error getting credential records:', error);
//       throw new InternalServerErrorException('Failed to get credential records: ' + error.message);
//     }
//   }

// }
