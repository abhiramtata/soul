import { Controller, Get } from '@nestjs/common';
import { AcmeAgentService } from './acme-agent.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';


@Controller('acme-agent')
export class AcmeAgentController {

    constructor(private readonly acmeService: AcmeAgentService) {}

    @Get('initialize')
    @ApiOperation({ summary: 'Initialize the Acme agent.' })
    @ApiResponse({
        status: 200,
        description: 'Acme agent initialized successfully.',
    })
    @ApiResponse({
        status: 409,
        description: 'Acme agent already initialized.',
    })
    @ApiResponse({
        status: 500,
        description: 'Internal serve error while initializing.',
    })
    async initializeAcmeAgent() {
        const result = await this.acmeService.initializeAcmeAgent();
        return {
        message: 'Acme agent initialized successfully',
        statusCode: result.statusCode,
        agentData: {
            label: result.data.config.label,
            walletId: result.data.config?.walletConfig?.id,
            endpoints: result.data.config.endpoints,
        },
        };
    }

}
