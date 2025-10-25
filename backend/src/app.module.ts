import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { ConnectionModule } from './connection/connection.module';
import { AcmeAgentModule } from './acme-agent/acme-agent.module';
import { BobAgentModule } from './bob-agent/bob-agent.module';
import { LedgerModule } from './ledger/ledger.module';
import { IssuanceModule } from './issuance/issuance.module';
import { RecordsModule } from './records/records.module';
import { VerificationModule } from './verification/verification.module';

@Module({
  imports: [ConnectionModule, AcmeAgentModule, BobAgentModule,LedgerModule, RecordsModule,IssuanceModule, VerificationModule], //LedgerModule, IssuanceModule
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
