import { Test, TestingModule } from '@nestjs/testing';
import { CommissionService } from './commission.service';

describe('CommissionService', () => {
  let service: CommissionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommissionService],
    }).compile();

    service = module.get<CommissionService>(CommissionService);
  });

  it('Should return correct commission for user id 42', () => {
    expect(service.calculateCommission({
        date: '2021-01-02',
        amount: '2000.00',
        currency: 'EUR',
        client_id: 42
      })
    ).toEqual({
      "amount": "0.05",
      "currency": "EUR"
    });
  })
  
});
