import { Test, TestingModule } from '@nestjs/testing';
import { BobAgentController } from './bob-agent.controller';

describe('BobAgentController', () => {
  let controller: BobAgentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BobAgentController],
    }).compile();

    controller = module.get<BobAgentController>(BobAgentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
