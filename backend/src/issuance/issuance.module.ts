import { Module ,Logger} from '@nestjs/common';
import { IssuanceController } from './issuance.controller';
import { IssuanceService } from './issuance.service';
import { AcmeAgentModule } from 'src/acme-agent/acme-agent.module';
import { BobAgentModule } from 'src/bob-agent/bob-agent.module';

@Module({
  imports: [AcmeAgentModule,BobAgentModule],
  controllers: [IssuanceController],
  providers: [IssuanceService,Logger]
})
export class IssuanceModule {}
