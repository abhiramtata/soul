import { Module } from '@nestjs/common';
import { RecordsService } from './records.service';
import { RecordsController } from './records.controller';
import { AcmeAgentModule } from 'src/acme-agent/acme-agent.module';
import { BobAgentModule } from 'src/bob-agent/bob-agent.module';

@Module({
  imports: [AcmeAgentModule, BobAgentModule],
  providers: [RecordsService],
  controllers: [RecordsController]
})
export class RecordsModule {}
