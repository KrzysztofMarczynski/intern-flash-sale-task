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

## Wymagany

Przed uruchomieniem projektu zainstaluj:

* Docker Desktop
* Git

## Uruchomienie

```bash
git clone https://github.com/KrzysztofMarczynski/Flash_sale.git
cd intern-flash-sale-task
docker compose up --build
```

Po zakończeniu inicjalizacji aplikacja będzie dostępna pod adresami:

* Frontend: http://localhost:3001
* Backend API: http://localhost:3000
