import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { CommissionModule } from './../src/commission/commission.module';

describe('Check for commission POST', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommissionModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/commission (POST)', () => {
    return request(app.getHttpServer())
      .post('/commission')
      .send({
        date: '2021-01-02',
        amount: '2000.00',
        currency: 'EUR',
        client_id: 42
      })
      .expect(201)
      .expect('{"amount":"0.05","currency":"EUR"}');
  });
});
