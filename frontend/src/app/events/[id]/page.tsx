'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

type Event = {
  id: string;
  name: string;
  totalTickets: number;
  availableTickets: number;
};

export default function EventDetailsPage() {
  const params = useParams();
  const queryClient = useQueryClient();

  const [message, setMessage] = useState('');

  const [reservationId, setReservationId] =
  useState<string | null>(null);

  const {
    data: event,
    isLoading,
    isError,
  } = useQuery<Event>({
    queryKey: ['event', params.id],
    queryFn: async () => {
      const response = await fetch(
        `http://localhost:3000/events/${params.id}`,
      );

      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }

      return response.json();
    },
  });

  const reserveMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        'http://localhost:3000/reserve',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            eventId: event?.id,
            userId: '1',
          }),
        },
      );

      if (!response.ok) {
        throw new Error();
      }

      return response.json();
    },

    onSuccess: (reservation) => {
      setReservationId(reservation.id);
setMessage(
  'Ticket reserved successfully. You have 5 minutes to complete the payment.',
);

      queryClient.invalidateQueries({
        queryKey: ['event', params.id],
      });

      queryClient.invalidateQueries({
        queryKey: ['events'],
      });
    },

    onError: () => {
      setMessage(
        'Reservation failed. Tickets may be sold out.',
      );
    },
  });
  const payMutation = useMutation({
  mutationFn: async () => {
    const response = await fetch(
      'http://localhost:3000/pay',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reservationId,
        }),
      },
    );

    if (!response.ok) {
      throw new Error();
    }

    return response.json();
  },

  onSuccess: () => {
    setMessage(
      'Payment completed successfully.',
    );

    setReservationId(null);
  },

  onError: () => {
    setMessage(
      'Payment failed.',
    );
  },
});

  if (isLoading) {
    return <p>Loading event...</p>;
  }

  if (isError || !event) {
    return <p>Could not load event.</p>;
  }

  return (
    <main style={{ padding: '2rem' }}>
      <h1>{event.name}</h1>

      <p>
        Available tickets: {event.availableTickets} /{' '}
        {event.totalTickets}
      </p>

      <button
        onClick={() => reserveMutation.mutate()}
        disabled={
          reserveMutation.isPending ||
          event.availableTickets === 0
        }
      >
        {reserveMutation.isPending
          ? 'Reserving...'
          : 'Reserve Ticket'}
      </button>

      {message && <p>{message}</p>}

      {reservationId && (
  <button
    onClick={() => payMutation.mutate()}
    disabled={payMutation.isPending}
  >
    {payMutation.isPending
      ? 'Processing payment...'
      : 'Pay Now'}
  </button>
)}
    </main>
  );
}