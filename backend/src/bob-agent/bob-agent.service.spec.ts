import { Test, TestingModule } from '@nestjs/testing';
import { BobAgentService } from './bob-agent.service';

describe('BobAgentService', () => {
  let service: BobAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BobAgentService],
    }).compile();

    service = module.get<BobAgentService>(BobAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
