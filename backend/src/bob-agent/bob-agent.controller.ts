import { Controller,Get } from '@nestjs/common';
import { BobAgentService } from './bob-agent.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('bob-agent')
export class BobAgentController {
    constructor(private readonly bobService: BobAgentService){}

    @Get('initialize')
    @ApiOperation({summary:'Initialize the Bob agent.'})
    @ApiResponse({
        status: 200,
        description:'Bob agent initialized successfully.'
    })
    @ApiResponse({
    status: 409,
    description: 'Bob agent already initialized.',
    })
    @ApiResponse({
    status: 500,
    description: 'Internal serve error while initializing.',
    })

    async intializeBobAgent(){
        const result = await this.bobService.initializeBobAgent();

        return {
            message: 'Bob agent initialized successfully',
            statusCode: result.statusCode,
            agentData: {
                label: result.data.config.label,
                walletId: result.data.config?.walletConfig?.id,
                endpoints: result.data.config.endpoints,
            },
        };
    }


}
