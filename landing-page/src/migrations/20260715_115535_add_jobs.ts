import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_jobs_status" AS ENUM('draft', 'published', 'closed');
  CREATE TYPE "public"."enum_jobs_employment_type" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACTOR', 'INTERN', 'TEMPORARY');
  CREATE TYPE "public"."enum_jobs_job_location_type" AS ENUM('TELECOMMUTE', 'ONSITE');
  CREATE TYPE "public"."enum_jobs_salary_currency" AS ENUM('EUR', 'USD', 'GBP');
  CREATE TYPE "public"."enum_jobs_salary_unit_text" AS ENUM('HOUR', 'DAY', 'WEEK', 'MONTH', 'YEAR');
  CREATE TABLE "jobs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar NOT NULL,
  	"status" "enum_jobs_status" DEFAULT 'draft' NOT NULL,
  	"date_posted" timestamp(3) with time zone NOT NULL,
  	"valid_through" timestamp(3) with time zone NOT NULL,
  	"employment_type" "enum_jobs_employment_type" DEFAULT 'FULL_TIME' NOT NULL,
  	"address_locality" varchar DEFAULT 'Paris' NOT NULL,
  	"address_country" varchar DEFAULT 'FR' NOT NULL,
  	"job_location_type" "enum_jobs_job_location_type" DEFAULT 'TELECOMMUTE',
  	"applicant_location_requirements" varchar,
  	"skills" varchar,
  	"salary_min" numeric,
  	"salary_max" numeric,
  	"salary_currency" "enum_jobs_salary_currency" DEFAULT 'EUR',
  	"salary_unit_text" "enum_jobs_salary_unit_text" DEFAULT 'YEAR',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "jobs_locales" (
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "jobs_id" integer;
  ALTER TABLE "jobs_locales" ADD CONSTRAINT "jobs_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE UNIQUE INDEX "jobs_slug_idx" ON "jobs" USING btree ("slug");
  CREATE INDEX "jobs_updated_at_idx" ON "jobs" USING btree ("updated_at");
  CREATE INDEX "jobs_created_at_idx" ON "jobs" USING btree ("created_at");
  CREATE UNIQUE INDEX "jobs_locales_locale_parent_id_unique" ON "jobs_locales" USING btree ("_locale","_parent_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_jobs_fk" FOREIGN KEY ("jobs_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_jobs_id_idx" ON "payload_locked_documents_rels" USING btree ("jobs_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "jobs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "jobs_locales" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "jobs" CASCADE;
  DROP TABLE "jobs_locales" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_jobs_fk";
  
  DROP INDEX "payload_locked_documents_rels_jobs_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "jobs_id";
  DROP TYPE "public"."enum_jobs_status";
  DROP TYPE "public"."enum_jobs_employment_type";
  DROP TYPE "public"."enum_jobs_job_location_type";
  DROP TYPE "public"."enum_jobs_salary_currency";
  DROP TYPE "public"."enum_jobs_salary_unit_text";`)
}
