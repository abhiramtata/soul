import { Controller, Post, Get, Body, Param, Query, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam } from '@nestjs/swagger';
import { LedgerService } from './ledger.service';
import { RegisterSchemaDto } from './dto/register-schema.dto';
import { RegisterCredDefDto } from './dto/register-cred-def.dto';
import { didGenerateDto } from './dto/register-did-generate.dto';

@Controller('ledger')
export class LedgerController {

    constructor (private readonly ledgerService: LedgerService){}

    @Post('use-existing-endorser')
    @ApiOperation({ summary: 'Use the existing endorser DID from BCovrin' })
    @ApiResponse({ status: 200, description: 'Endorser DID imported successfully.' })
    async useExistingEndorserDid() {
        const result = await this.ledgerService.useExistingEndorserDid();
        return result;
    }

    @Post('schema')
    @ApiOperation({ summary: 'Registering schema by Acme agent as issuer.' })
    @ApiResponse({ status: 201, description: 'Schema registered successfully.' })
    @ApiResponse({ status: 404, description: 'Acme agent is not initialized.' })
    @ApiResponse({ status: 500, description: 'Internal server error while registering.' })
    async registerSchema(@Body() data: RegisterSchemaDto) {
        const result = await this.ledgerService.registerSchema(data);
        return result;
    }

    @Post('did-generate')
    @ApiOperation({ summary: 'Register a new DID with endorser rights' })
    async didGenerate(@Body() data: didGenerateDto) {
        const result = await this.ledgerService.didGenerate(data);
        return result;
    }
    

    @Post('credential-definition')
    @ApiOperation({ summary: 'Registering credential definition by Acme agent as issuer.' })
    @ApiResponse({ status: 201, description: 'Credential definition created successfully.' })
    @ApiResponse({ status: 404, description: 'Acme agent is not initialized.' })
    @ApiResponse({ status: 400, description: 'Invalid inputs.' })
    @ApiResponse({ status: 500, description: 'Internal server error while registering.' })
    async registerCredentialDefinition(@Body() data: RegisterCredDefDto) {
        const result = await this.ledgerService.registerCredentialDefinition(data);
        return result;
    }

    // @Get('schema/:schemaId')
    // @ApiOperation({ summary: 'Get schema by ID' })
    // async getSchema(@Param('schemaId') schemaId: string) {
    //     const result = await this.ledgerService.getSchema(schemaId);
    //     return result;
    // }


    // @Get('debug-anoncreds')
    // @ApiOperation({ summary: 'Debug anoncreds API' })
    // async debugAnoncredsApi() {
    //     const result = await this.ledgerService.debugAnoncredsApi();
    //     return result;
    // }

}