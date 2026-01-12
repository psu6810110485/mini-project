import { Test, TestingModule } from '@nestjs/testing';
import { FlightsService } from './flights.service';

describe('FlightsService', () => { // ทดสอบ FlightsService
  let service: FlightsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlightsService],
    }).compile();

    service = module.get<FlightsService>(FlightsService);
  });

  it('should be defined', () => { // ตรวจสอบว่า service ถูกสร้างขึ้นมาได้หรือไม่
    expect(service).toBeDefined();
  });
});
