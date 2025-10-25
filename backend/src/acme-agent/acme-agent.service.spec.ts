import { Test, TestingModule } from '@nestjs/testing';
import { AcmeAgentService } from './acme-agent.service';

describe('AcmeAgentService', () => {
  let service: AcmeAgentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcmeAgentService],
    }).compile();

    service = module.get<AcmeAgentService>(AcmeAgentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
