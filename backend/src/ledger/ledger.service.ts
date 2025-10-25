import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { AcmeAgentService } from '../acme-agent/acme-agent.service';
import { RegisterSchemaDto } from './dto/register-schema.dto';
import { RegisterCredDefDto } from './dto/register-cred-def.dto';
import { CredentialDefinition } from '@hyperledger/anoncreds-nodejs';
import axios, { options } from 'axios';
import { didGenerateDto } from './dto/register-did-generate.dto';
import { KeyType, TypedArrayEncoder } from '@credo-ts/core';

@Injectable()
export class LedgerService {
  
    constructor(
        private readonly acmeService: AcmeAgentService,
        private readonly logger: Logger
    ){}

    async useExistingEndorserDid():Promise<unknown> {

        try{

            const agent = this.acmeService.getAgent();

             // Use the DID you just registered on BCovrin
            const endorserDid = 'did:indy:bcovrin:test:Rd9qPZJiR9iiindfkHt7yZ';
            const endorserSeed = 'ju000000000000000000000000000000';

            this.logger.log('Importing endorser DID:', endorserDid);

            // Import the DID into the wallet
            const result = await agent.dids.import({
                did: endorserDid,
                overwrite: true,
                privateKeys: [
                    {
                        keyType: KeyType.Ed25519,
                        privateKey: TypedArrayEncoder.fromString(endorserSeed),
                    },
                ],
            });

            this.logger.log('Endorser DID import result:', result);

            // Verify the DID was imported
            const resolution = await agent.dids.resolve(endorserDid);
            this.logger.log('Endorser DID resolution successful:', resolution.didDocument?.id);

            return {
                statusCode: HttpStatus.OK,
                message: 'Endorser DID imported successfully',
                data: {
                    did: endorserDid,
                    importResult: result,
                },
            };   


        }catch (error) {
            console.error('Error importing endorser DID:', error);
            throw new InternalServerErrorException('Failed to import endorser DID: ' + error.message);
        }

    }

    async registerSchema(dto:RegisterSchemaDto): Promise<unknown> {
        
        try{

            const agent = this.acmeService.getAgent();

            // First, verify the DID exists and has private key
            try {
                const didResult = await agent.dids.resolve(dto.issuerId);
                if (!didResult.didDocument) {
                    throw new BadRequestException(`DID ${dto.issuerId} not found in wallet`);
                }
                this.logger.log('Issuer DID verified:', didResult.didDocument.id);
            } catch (error) {
                throw new BadRequestException(`Cannot resolve issuer DID: ${dto.issuerId}. Please import it first.`);
            }


            const schemaResult = await agent.modules.anoncreds.registerSchema({

                schema: {

                    attrNames: [
                        'Name',
                        'Email ID',
                        'Organisation Name',
                        'Organisation ID',
                        'Role',

                    ],
                    issuerId: dto.issuerId,

                    name:'CDB_Login',
                    version: '1.0',

                },
                options: {},

            });

            if (schemaResult.schemaState.state === 'failed') {
                throw new BadRequestException(
                    `Schema registration failed: ${schemaResult.schemaState.reason}`
                );
            }

            return {
                statusCode: HttpStatus.CREATED,
                message:'Schema registered successfully',
                data:schemaResult,
            };


        }catch (error){

            console.error('Error redistering schema:', error);
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Failed to register schema');

        } 
    }

    async didGenerate(dto: didGenerateDto):Promise<unknown> {

        try{

            const agent = this.acmeService.getAgent();

            const response = await axios.post (
                `http://test.bcovrin.vonx.io/register`,
                {
                    role: 'ENDORSER',
                    alias: 'Alias',
                    seed: dto.seed,
                },
            )

            if (!response.data?.did) {
                throw new BadRequestException('Failed to register DID on ledger: ' + JSON.stringify(response.data));
            }

            // const result = await agent.dids.import({
            //     did: 'did:indy:bcovrin:test:WgWxqztrNooG92RXvxSTWv',
            //     overwrite: true,
            //     privateKeys: [
            //         {
            //         keyType: KeyType.Ed25519,
            //         privateKey: TypedArrayEncoder.fromString('000000000000000000000000Steward1'),
            //         },
            //     ],
            // });

            const ledgerDid = response.data.did;
            this.logger.log('DID registered on ledger:', ledgerDid);  
            

            // const result = await agent.dids.import({
            //     did: `did:${dto.method}:${dto.namespace}:${dto.did}`,
            //     overwrite: true,
            //     privateKeys: [
            //         {
            //         keyType: KeyType.Ed25519,
            //         privateKey: TypedArrayEncoder.fromString(dto.seed),
            //         },
            //     ],
            // });

            
            // Use the ACTUAL DID from the ledger response, not the one from dto
            const result = await agent.dids.import({
                did: `did:indy:${dto.namespace}:${ledgerDid}`, // Use the actual DID from ledger
                overwrite: true,
                privateKeys: [
                    {
                        keyType: KeyType.Ed25519,
                        privateKey: TypedArrayEncoder.fromString(dto.seed),
                    },
                ],
            });

            console.log('DID import result:', result);

            return {
                
                statusCode: HttpStatus.CREATED,
                message: 'DID registered successfully',
                data: {
                    ledgerDid: ledgerDid,
                    importResult: result,
                }, 

            };


        } catch (error) {
            console.error('DID registration error:', error);
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            throw new InternalServerErrorException('Error in did registration: ' + error.message);
        }
        

    }




   async registerCredentialDefinition(data: RegisterCredDefDto): Promise<unknown> {
        try {
            const agent = this.acmeService.getAgent();

            this.logger.log('Starting credential definition registration for v0.5.17...');
            this.logger.log('Issuer ID:', data.issuerId);
            this.logger.log('Schema ID:', data.schemaId);

            // For v0.5.17, use this exact structure
            const credentialDefinitionResult = await agent.modules.anoncreds.registerCredentialDefinition({
                credentialDefinition: {
                    tag: 'CDBLogin',
                    issuerId: data.issuerId,
                    schemaId: data.schemaId
                },
                options: {
                    supportRevocation: false,
                },
            });

            this.logger.log('Credential definition registration completed');

            if (credentialDefinitionResult.credentialDefinitionState.state === 'failed') {
                throw new BadRequestException(
                    `Credential definition registration failed: ${credentialDefinitionResult.credentialDefinitionState.reason}`
                );
            }

            return {
                statusCode: HttpStatus.CREATED,
                message: 'Credential Definition created successfully',
                data: credentialDefinitionResult,
            };

        } catch (error) {
            console.error('Error registering credential definition:', error);
            
            // More detailed error logging
            this.logger.error('v0.5.17 API Error:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            if (error instanceof NotFoundException || error instanceof BadRequestException) {
                throw error;
            }
            
            throw new InternalServerErrorException(
                'Error in registering credential definition: ' + error.message
            );
        }
    }

    // async getSchema(schemaId: string): Promise<unknown> {
    //     try {
    //         const agent = this.acmeService.getAgent();
    //         const schema = await agent.modules.anoncreds.getSchema(schemaId);
            
    //         return {
    //             statusCode: HttpStatus.OK,
    //             message: 'Schema retrieved successfully',
    //             data: schema,
    //         };
    //     } catch (error) {
    //         throw new BadRequestException('Error retrieving schema: ' + error.message);
    //     }
    // }

    // async debugAnoncredsApi(): Promise<unknown> {
    //     try {
    //         const agent = this.acmeService.getAgent();
            
    //         // Check what methods are available
    //         const anoncredsModule = agent.modules.anoncreds;
    //         const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(anoncredsModule))
    //             .filter(method => method !== 'constructor' && typeof anoncredsModule[method] === 'function');
            
    //         this.logger.log('Available anoncreds methods:', methods);
            
    //         // Also check the registerCredentialDefinition function
    //         if (anoncredsModule.registerCredentialDefinition) {
    //             this.logger.log('registerCredentialDefinition function exists');
    //             this.logger.log('Function length (expected parameters):', anoncredsModule.registerCredentialDefinition.length);
    //         }
            
    //         return {
    //             statusCode: HttpStatus.OK,
    //             message: 'Anoncreds API debug info',
    //             data: {
    //                 methods,
    //                 hasRegisterCredentialDefinition: !!anoncredsModule.registerCredentialDefinition,
    //             },
    //         };
    //     } catch (error) {
    //         throw new InternalServerErrorException('Error debugging anoncreds API: ' + error.message);
    //     }
    // }




    // // Add this method to list all DIDs in wallet
    // async listDids(): Promise<unknown> {
    //     try {
    //         const agent = this.acmeService.getAgent();
    //         const dids = await agent.dids.getCreatedDids();
            
    //         return {
    //             statusCode: HttpStatus.OK,
    //             message: 'DIDs retrieved successfully',
    //             data: dids.map(did => ({
    //                 did: did.did,
    //                 method: did.method,
    //             })),
    //         };
    //     } catch (error) {
    //         throw new InternalServerErrorException('Error listing DIDs: ' + error.message);
    //     }
    // }





}