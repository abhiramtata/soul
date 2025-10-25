import { Injectable, ConflictException, Logger,HttpStatus,NotFoundException } from '@nestjs/common';
import type { InitConfig } from '@credo-ts/core'
import { Agent, ConsoleLogger, LogLevel, ConnectionsModule, DidsModule, CredentialsModule, V2CredentialProtocol, OutOfBandModule, ProofsModule, AutoAcceptProof, V2ProofProtocol } from '@credo-ts/core'
import { agentDependencies, HttpInboundTransport } from '@credo-ts/node'

import { AskarModule } from '@credo-ts/askar'
import { ariesAskar } from '@hyperledger/aries-askar-nodejs'

import { HttpOutboundTransport, WsOutboundTransport } from '@credo-ts/core'

import { IndyVdrAnonCredsRegistry, IndyVdrIndyDidRegistrar, IndyVdrIndyDidResolver, IndyVdrModule } from '@credo-ts/indy-vdr'
import { indyVdr } from '@hyperledger/indy-vdr-nodejs'

import { AnonCredsCredentialFormatService, AnonCredsModule, AnonCredsProofFormatService } from '@credo-ts/anoncreds'
import { anoncreds } from '@hyperledger/anoncreds-nodejs'

// import { genesisTransactions } from 'src/utils/genesis_transaction';
import axios from 'axios';

@Injectable()
export class AcmeAgentService {
    
        public acmeAgent: Agent<any> | null = null;
        private readonly logger = new Logger(AcmeAgentService.name)  

        // constructor(private readonly logger: Logger) {}

        async initializeAcmeAgent() {

            try{
                if (this.acmeAgent && this.acmeAgent.isInitialized) {
                throw new ConflictException('Acme agent already initialized');
                }

                const config: InitConfig = {
                label: 'demo-agent-acme',
                 walletConfig: {
                    id: 'mainAcme70',
                    key: 'demoagentacme0000000000000000000',
                },
                logger: new ConsoleLogger(LogLevel.debug),
                endpoints: ['http://localhost:3002'], // match port with inbound transport
                }

                this.acmeAgent = new Agent({
                config,
                dependencies: agentDependencies,
                    
                modules: {
                    askar: new AskarModule({ ariesAskar }),

                    connections: new ConnectionsModule({ autoAcceptConnections: true }),

                    oob: new OutOfBandModule(),

                    indyVdr: new IndyVdrModule({
                      indyVdr,
                      networks: [
                        {
                          isProduction: false,
                          indyNamespace: 'bcovrin:test',
                          genesisTransactions: (await axios.get('https://test.bcovrin.vonx.io/genesis')).data,
                            //genesisTransactions:genesisTransactions,
                          connectOnStartup: true,
                        },
                      ],
                    }),

                    anoncreds: new AnonCredsModule({
                    registries: [new IndyVdrAnonCredsRegistry()],
                    anoncreds,
                    }),

                    dids:new DidsModule({
                        registrars:[new IndyVdrIndyDidRegistrar()],
                        resolvers: [new IndyVdrIndyDidResolver()],
                    }),

                    credentials: new CredentialsModule({
                        credentialProtocols:[
                            new V2CredentialProtocol({
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

                },
        })

                // Setup transports WebSocket,Http outbound,Http inbound
                this.acmeAgent.registerOutboundTransport(new HttpOutboundTransport())
                this.acmeAgent.registerOutboundTransport(new WsOutboundTransport())
                this.acmeAgent.registerInboundTransport(new HttpInboundTransport({ port: 3002 }))

                // Initialize the agent
                await this.acmeAgent.initialize()
                this.logger.log('Credo Acme Agent initialized with Indy, Askar, AnonCreds, and Cheqd')

                this.setAgent(this.acmeAgent);

                return {
                    statusCode: HttpStatus.OK,
                    message: 'Acme agent initialized successfully',
                    data: this.acmeAgent,
                };

            } catch (error) {
                this.logger.error('Error initializing Acme agent:', error);
                throw error;
            }
                
        }

        private setAgent(agent: Agent) {
            this.acmeAgent = agent;
        }

        public getAgent() {
            if (!this.acmeAgent) {
            throw new NotFoundException(
                'Acme agent not initialized. Please initialize first.',
            );
            }
            return this.acmeAgent;
        }
}
