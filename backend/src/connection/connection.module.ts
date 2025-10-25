import { Module } from '@nestjs/common';
import { ConnectionController } from './connection.controller';
import { ConnectionService } from './connection.service';
import { AcmeAgentModule } from 'src/acme-agent/acme-agent.module';
import { BobAgentModule } from 'src/bob-agent/bob-agent.module';

@Module({
  imports:[AcmeAgentModule, BobAgentModule],
  controllers: [ConnectionController],
  providers: [ConnectionService]
})
export class ConnectionModule {}
