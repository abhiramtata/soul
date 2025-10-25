import { AskarModule } from '@credo-ts/askar';
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'
import { ConnectionsModule, InitConfig, Agent, LogLevel, WsOutboundTransport, HttpOutboundTransport, ConsoleLogger, DidsModule, CredentialsModule, V2CredentialProtocol, ProofsModule, AutoAcceptProof, V2ProofProtocol} from '@credo-ts/core';
import { IndyVdrAnonCredsRegistry, IndyVdrIndyDidRegistrar, IndyVdrIndyDidResolver, IndyVdrModule } from '@credo-ts/indy-vdr';
import { indyVdr } from '@hyperledger/indy-vdr-nodejs';
import { ConflictException, Logger, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { agentDependencies, HttpInboundTransport } from '@credo-ts/node';
import { anoncreds } from '@hyperledger/anoncreds-nodejs';
import { AnonCredsCredentialFormatService, AnonCredsModule, AnonCredsProofFormatService } from '@credo-ts/anoncreds';
import { genesisTransactions } from 'src/utils/genesis_transaction';
import axios from 'axios';

@Injectable()
export class BobAgentService {

    private bobAgent: Agent
    private readonly logger = new Logger(BobAgentService.name)  

    async initializeBobAgent(){
        try{

            if(this.bobAgent && this.bobAgent.isInitialized){
                throw new ConflictException ("Bob agent already initialized")
            }

            const config: InitConfig = {
                label: 'docs-agent-Bob',
                walletConfig: {
                    id:'mainBob07',
                    key:'demoagentbob00000000000000000000'
                },
                logger: new ConsoleLogger(LogLevel.debug),
                endpoints:['http://localhost:3003'],
            }

            this.bobAgent = new Agent({
                config,
                dependencies:agentDependencies,
                modules: {

                    askar: new AskarModule({ariesAskar}),

                    connections: new ConnectionsModule({autoAcceptConnections: true}),

                    anoncreds:new AnonCredsModule({
                        registries:[new IndyVdrAnonCredsRegistry()],
                        anoncreds,
                    }),

                    indyVdr: new IndyVdrModule({
                        indyVdr,
                        networks: [

                            {
                                isProduction: false,
                                indyNamespace:'bcovrin:test',
                                genesisTransactions: (await axios.get('https://test.bcovrin.vonx.io/genesis')).data,
                                // genesisTransactions: genesisTransactions,
                                connectOnStartup: true,
                            }

                        ]
                    }),

                    dids: new DidsModule({
                        registrars: [new IndyVdrIndyDidRegistrar()],
                        resolvers: [new IndyVdrIndyDidResolver()],
                    }),

                    credentials:new CredentialsModule({
                        credentialProtocols: [
                            new V2CredentialProtocol ({
                                credentialFormats: [new AnonCredsCredentialFormatService()],
                            })
                        ]
                    }),

                    proofs: new ProofsModule({
                        proofProtocols: [
                            new V2ProofProtocol({
                                proofFormats: [new AnonCredsProofFormatService()],
                            })
                        ],
                        autoAcceptProofs: AutoAcceptProof.ContentApproved,
                    }),
                    
                }
            })
            
            this.bobAgent.registerOutboundTransport(new WsOutboundTransport());
            this.bobAgent.registerOutboundTransport(new HttpOutboundTransport());
            this.bobAgent.registerInboundTransport(
                new HttpInboundTransport({port: 3003}),
            );

            await this.bobAgent.initialize();
            this.setAgent(this.bobAgent);
            return{
                statusCode: HttpStatus.OK,
                message: 'Bob agent initialized successfully',
                data:this.bobAgent
            }


        } catch (error){
            this.logger.error("Error initializing Bob agent:", error);
            throw error;
        }
    }

    private setAgent(agent: Agent){
        this.bobAgent = agent;
    }

    public getAgent(): Agent {
        if(!this.bobAgent){
            throw new NotFoundException(
                'Bob agent not initialized. Initialize it first'
            )
        }
        return this.bobAgent;
    }

}
