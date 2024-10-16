import { Test, TestingModule } from '@nestjs/testing';
import { NplService } from './npl.service';

describe('NplService', () => {
  let service: NplService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NplService],
    }).compile();

    service = module.get<NplService>(NplService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
