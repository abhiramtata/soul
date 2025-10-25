import { Module, Logger  } from '@nestjs/common';
import { AcmeAgentController } from './acme-agent.controller';
import { AcmeAgentService } from './acme-agent.service';

@Module({
  controllers: [AcmeAgentController],
  providers: [AcmeAgentService, Logger],
  exports: [AcmeAgentService],
})
export class AcmeAgentModule {}
