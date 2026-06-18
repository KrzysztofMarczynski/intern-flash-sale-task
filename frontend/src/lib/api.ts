export interface Event {
  id: string;
  name: string;
  totalTickets: number;
  availableTickets: number;
}

const API_URL = 'http://localhost:3000';

export async function getEvents(): Promise<Event[]> {
  const response = await fetch(`${API_URL}/events`);

  if (!response.ok) {
    throw new Error('Failed to fetch events');
  }

  return response.json();
}