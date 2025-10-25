import { Test, TestingModule } from '@nestjs/testing';
import { AcmeAgentController } from './acme-agent.controller';

describe('AcmeAgentController', () => {
  let controller: AcmeAgentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcmeAgentController],
    }).compile();

    controller = module.get<AcmeAgentController>(AcmeAgentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
