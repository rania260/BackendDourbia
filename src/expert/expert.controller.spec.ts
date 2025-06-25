import { Test, TestingModule } from '@nestjs/testing';
import { ExpertController } from './expert.controller';
import { ExpertService } from './expert.service';

describe('ExpertController', () => {
  let controller: ExpertController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ExpertController],
      providers: [ExpertService],
    }).compile();

    controller = module.get<ExpertController>(ExpertController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
