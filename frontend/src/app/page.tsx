'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

import { getEvents } from '@/lib/api';
import styles from './page.module.css';

export default function Home() {
  const {
    data: events,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  });

  if (isLoading) {
    return (
      <main className={styles.page}>
        <p className={styles.status}>Loading events...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className={styles.page}>
        <p className={styles.status}>Could not load events.</p>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p className={styles.eyebrow}>
          Concurrency-safe ticket booking
        </p>

        <h1>Flash Sale Tickets</h1>
      </section>

      <section className={styles.eventsList}>
        {events?.map((event) => (
          <Link
            href={`/events/${event.id}`}
            key={event.id}
            className={styles.eventLink}
          >
            <article className={styles.eventCard}>
              <div>
                <h2>{event.name}</h2>

                <p>
                  {event.availableTickets} available /{' '}
                  {event.totalTickets} total
                </p>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </main>
  );
}