import { Module } from '@nestjs/common';
import { VerificationController } from './verification.controller';
import { VerificationService } from './verification.service';
import { AcmeAgentModule } from 'src/acme-agent/acme-agent.module';
import { BobAgentModule } from 'src/bob-agent/bob-agent.module';

@Module({
  imports:[AcmeAgentModule,BobAgentModule],
  controllers: [VerificationController],
  providers: [VerificationService]
})
export class VerificationModule {}
