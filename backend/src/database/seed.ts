import dataSource from './data-source';
import { Event } from '../events/entities/event.entity';

async function seed() {
  await dataSource.initialize();

  try {
    console.log('Cleaning database...');

    await dataSource.query(`
      TRUNCATE TABLE reservations, events
      RESTART IDENTITY CASCADE
    `);

    console.log('Creating sample events...');

    const eventRepository = dataSource.getRepository(Event);

    await eventRepository.save([
      {
        name: 'Rock Night',
        totalTickets: 10,
        availableTickets: 10,
      },
      {
        name: 'Jazz Evening',
        totalTickets: 5,
        availableTickets: 5,
      },
      {
        name: 'Tech Conference',
        totalTickets: 20,
        availableTickets: 20,
      },
    ]);

    console.log('Seed completed successfully.');
  } catch (error) {
    console.error('Seed failed:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();
