import { Module,Logger } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';
import { AcmeAgentModule } from '../acme-agent/acme-agent.module';

@Module({
  imports: [AcmeAgentModule],
  controllers: [LedgerController],
  providers: [LedgerService,Logger],
  exports: [LedgerService],
})
export class LedgerModule {}
