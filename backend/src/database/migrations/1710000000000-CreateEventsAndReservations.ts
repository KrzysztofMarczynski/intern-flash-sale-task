import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateEventsAndReservations1710000000000 implements MigrationInterface {
  name = 'CreateEventsAndReservations1710000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "events" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "totalTickets" integer NOT NULL,
        "availableTickets" integer NOT NULL,
        CONSTRAINT "PK_events_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "reservation_status_enum" AS ENUM (
        'RESERVED',
        'PAID',
        'EXPIRED'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "reservations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "userId" character varying NOT NULL,
        "status" "reservation_status_enum" NOT NULL DEFAULT 'RESERVED',
        "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "eventId" uuid NOT NULL,
        CONSTRAINT "PK_reservations_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_reservations_eventId"
          FOREIGN KEY ("eventId")
          REFERENCES "events"("id")
          ON DELETE NO ACTION
          ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "reservations"
    `);

    await queryRunner.query(`
      DROP TYPE "reservation_status_enum"
    `);

    await queryRunner.query(`
      DROP TABLE "events"
    `);
  }
}
