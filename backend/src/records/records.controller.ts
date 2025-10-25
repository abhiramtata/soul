import { Controller,Get, Query,Delete} from '@nestjs/common';
import { RecordsService } from './records.service';
import { ApiOperation, ApiResponse,ApiQuery } from '@nestjs/swagger';
import { agentType,credRecordIdDto,getCredByIdDto,getCredBythreadIdDto,getRecordsDto } from './dto/records.dto';

@Controller('records')
export class RecordsController {

    constructor(
        private readonly recordService: RecordsService
    ) {}

    @Get('agent-records')
    @ApiOperation({ summary: 'Fetching all records of agents.' })
    @ApiResponse({
        status: 200,
    description: 'Fetched the records of agent successfully.',
    })
    @ApiResponse({
        status: 404,
        description: 'Bob/Acme agent is not initialized.',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal serve error while fetching.',
    })
    @ApiQuery({ name: 'agent', enum: agentType })
    async getOffers(@Query() data: getRecordsDto) {
        return await this.recordService.getCredentialRecords(data.agent);
    }


    @Delete('delete-credential')
    async deleteRecord(@Query() id: credRecordIdDto) {
        return await this.recordService.deleteCredentialById(id);
    }


    @Get('recordById')
    @ApiOperation({ summary: 'Fetching all records of agents by recordId.' })
    @ApiResponse({
        status: 200,
        description: 'Fetched the records of agent by Id successfully.',
    })
    @ApiResponse({
        status: 404,
        description: 'Bob/Acme agent is not initialized.',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal serve error while fetching.',
    })
    @ApiQuery({ name: 'agent', enum: agentType })
    @ApiQuery({ name: 'credId', type: String })
    async getRecords(@Query() data: getCredByIdDto) {
        return await this.recordService.getCredentialRecordById(data.agent, data);
    }

}
