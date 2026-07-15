import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "spontaneous_applications" DROP CONSTRAINT "spontaneous_applications_resume_id_media_id_fk";
  
  ALTER TABLE "spontaneous_applications" ADD CONSTRAINT "spontaneous_applications_resume_id_resumes_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."resumes"("id") ON DELETE set null ON UPDATE no action;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "spontaneous_applications" DROP CONSTRAINT "spontaneous_applications_resume_id_resumes_id_fk";
  
  ALTER TABLE "spontaneous_applications" ADD CONSTRAINT "spontaneous_applications_resume_id_media_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;`)
}
