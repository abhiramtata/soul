import { Module } from '@nestjs/common';
import { BobAgentController } from './bob-agent.controller';
import { BobAgentService } from './bob-agent.service';

@Module({
  controllers: [BobAgentController],
  providers: [BobAgentService],
  exports: [BobAgentService],
})
export class BobAgentModule {}
