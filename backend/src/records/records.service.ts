import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { privateDecrypt } from 'crypto';
import { AcmeAgentService } from 'src/acme-agent/acme-agent.service';
import { BobAgentService } from 'src/bob-agent/bob-agent.service';
import { agentType,credRecordIdDto,getCredByIdDto,getCredBythreadIdDto } from './dto/records.dto';


@Injectable()
export class RecordsService {

constructor(
    private readonly acmeService: AcmeAgentService,
    private readonly bobService: BobAgentService,
) {}

  async getCredentialRecords (agentName: agentType) : Promise<unknown>{
    try{

        let agent:any;

        if(agentName == agentType.ACME){
            agent = this.acmeService.getAgent();
        } else if (agentName == agentType.BOB) {
            agent = this.bobService.getAgent();
        }

        const records: unknown = await agent.credentials.getAll();
        return{
            statusCode: HttpStatus.OK,
            message:'Records retrieved successfully',
            data: records
        }

    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to return records: ${error.message}`,
      );
    }
  }

  async deleteCredentialById(id: credRecordIdDto): Promise<unknown> {

    try{

      const agent = this.bobService.getAgent();
      const record = await agent.credentials.findById(id.credentialRecordId)

      if (record) {
        return agent.credentials.deleteById(id.credentialRecordId);
      }
      throw new BadRequestException(
        `Credential for ${id.credentialRecordId} does not exist`,
      );


    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to return records: ${error.message}`,
      );
    }
  }

  async getCredentialRecordById(agentName: agentType,credId:getCredByIdDto): Promise<unknown>{

    try{

      let agent:any;

      if(agentName == agentType.ACME){
        agent = this.acmeService.getAgent();
      } 
      
      else if (agentName == agentType.BOB) {
        agent = this.bobService.getAgent();
      }

      const records: unknown = await agent.credentials.getById(credId.credId);

      return {
        statusCode: HttpStatus.OK,
        message: 'Record by recordId retrieved successfully',
        data: records,
      };


    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to return records: ${error.message}`,
      );
    }

  }

  

}
