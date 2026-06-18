# Flash Sale Ticket Reservation System

System rezerwacji biletów odporny na overbooking i problemy współbieżności.

## Stack

**Backend:** NestJS, TypeScript, PostgreSQL, TypeORM, SSE, Jest, Supertest  
**Frontend:** Next.js, React, TypeScript, TanStack Query  
**Infra:** Docker Compose

## Funkcje

- lista i szczegóły wydarzeń,
- rezerwacja biletu na 5 minut,
- symulowana płatność przez `/pay`,
- automatyczne zwalnianie nieopłaconych rezerwacji,
- aktualizacja liczby biletów w czasie rzeczywistym przez SSE,
- ochrona przed overbookingiem przez transakcje i pessimistic locking,
- rate limiting,
- test integracyjny równoległych rezerwacji.

## Uruchomienie

## Wymagany

Docker
GIT

```bash
git clone https://github.com/KrzysztofMarczynski/Flash_sale.git
cd Flash_sale
docker compose up --build
