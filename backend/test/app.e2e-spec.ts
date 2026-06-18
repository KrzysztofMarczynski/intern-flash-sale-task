import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request from 'supertest';
import {
  beforeAll,
  beforeEach,
  afterAll,
  describe,
  expect,
  it,
} from '@jest/globals';

import { AppModule } from './../src/app.module';

describe('Reservations (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    await app.init();

    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query(
      'TRUNCATE TABLE reservations RESTART IDENTITY CASCADE',
    );

    await dataSource.query('TRUNCATE TABLE events RESTART IDENTITY CASCADE');
  });

  it('should reserve one ticket', async () => {
    const event = await dataSource.query(`
    INSERT INTO events
      (id, name, "totalTickets", "availableTickets")
    VALUES
      (gen_random_uuid(), 'Test Event', 10, 10)
    RETURNING *;
  `);

    const eventId = event[0].id;

    const response = await request(app.getHttpServer()).post('/reserve').send({
      eventId,
      userId: 'test-user',
    });

    expect(response.status).toBe(201);

    const updatedEvent = await dataSource.query(
      `
      SELECT *
      FROM events
      WHERE id = $1
    `,
      [eventId],
    );

    expect(updatedEvent[0].availableTickets).toBe(9);
  });

  it('should prevent overbooking', async () => {
    const event = await dataSource.query(`
    INSERT INTO events
      (id, name, "totalTickets", "availableTickets")
    VALUES
      (gen_random_uuid(), 'Flash Sale Test', 10, 10)
    RETURNING *;
  `);

    const eventId = event[0].id;

    const requests = Array.from({ length: 100 }, (_, index) =>
      request(app.getHttpServer())
        .post('/reserve')
        .send({
          eventId,
          userId: `user-${index}`,
        }),
    );

    const responses = await Promise.all(requests);

    const successfulReservations = responses.filter(
      (response) => response.status === 201,
    );

    const failedReservations = responses.filter(
      (response) => response.status !== 201,
    );

    expect(successfulReservations.length).toBe(10);

    expect(failedReservations.length).toBe(90);

    const updatedEvent = await dataSource.query(
      `
      SELECT *
      FROM events
      WHERE id = $1
    `,
      [eventId],
    );

    expect(updatedEvent[0].availableTickets).toBe(0);
  });

  afterAll(async () => {
    await app.close();
  });
});
