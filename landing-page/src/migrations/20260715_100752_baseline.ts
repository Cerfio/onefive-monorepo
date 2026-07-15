import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."_locales" AS ENUM('en', 'fr');
  CREATE TYPE "public"."enum_team_socials_type" AS ENUM('linkedin', 'twitter', 'github', 'medium', 'dribbble');
  CREATE TYPE "public"."enum_team_category" AS ENUM('Founder', 'Product', 'Tech', 'Community', 'other');
  CREATE TYPE "public"."enum_releases_changes_type" AS ENUM('feature', 'improvement', 'bugfix', 'security');
  CREATE TYPE "public"."enum_contact_category" AS ENUM('technical', 'account', 'feature', 'billing', 'partnership', 'other');
  CREATE TYPE "public"."enum_contact_status" AS ENUM('new', 'in-progress', 'resolved', 'archived');
  CREATE TYPE "public"."enum_feedback_category" AS ENUM('feature', 'bug', 'ux', 'content', 'other');
  CREATE TYPE "public"."enum_feedback_status" AS ENUM('new', 'under-review', 'planned', 'implemented', 'rejected', 'archived');
  CREATE TYPE "public"."enum_feedback_priority" AS ENUM('low', 'medium', 'high', 'critical');
  CREATE TYPE "public"."enum_recent_updates_status" AS ENUM('Launched', 'In Progress', 'Planned');
  CREATE TYPE "public"."enum_bug_reports_category" AS ENUM('ui', 'functionality', 'performance', 'account', 'mobile', 'other');
  CREATE TYPE "public"."enum_bug_reports_priority" AS ENUM('low', 'medium', 'high');
  CREATE TYPE "public"."enum_bug_reports_status" AS ENUM('new', 'in-review', 'in-progress', 'resolved', 'closed');
  CREATE TYPE "public"."enum_waitlist_job" AS ENUM('founder', 'investor', 'aspiring-founder', 'student', 'startup-employee', 'other');
  CREATE TYPE "public"."enum_waitlist_source" AS ENUM('linkedin', 'product-hunt', 'twitter', 'friend', 'google', 'other');
  CREATE TYPE "public"."enum_waitlist_goal" AS ENUM('find-cofounders', 'gain-visibility', 'access-funding', 'learn-resources', 'discover-events', 'other');
  CREATE TYPE "public"."enum_waitlist_status" AS ENUM('pending', 'approved', 'invited', 'active');
  CREATE TYPE "public"."enum_newsletter_status" AS ENUM('active', 'inactive', 'unsubscribed', 'bounced');
  CREATE TYPE "public"."enum_newsletter_source" AS ENUM('website_footer', 'newsletter_page', 'blog_popup', 'manual_import', 'other');
  CREATE TYPE "public"."enum_spontaneous_applications_preferred_department" AS ENUM('Engineering', 'Product', 'Design', 'Marketing', 'Sales', 'Operations', 'HR', 'Finance');
  CREATE TYPE "public"."enum_spontaneous_applications_status" AS ENUM('new', 'under_review', 'contacted', 'interview_scheduled', 'rejected', 'hired');
  CREATE TYPE "public"."enum_resumes_status" AS ENUM('new', 'under_review', 'shortlisted', 'rejected', 'hired');
  CREATE TYPE "public"."enum_articles_status" AS ENUM('draft', 'review', 'published');
  CREATE TYPE "public"."enum_article_suggestions_status" AS ENUM('pending', 'reviewing', 'approved', 'rejected');
  CREATE TYPE "public"."enum_article_suggestions_category" AS ENUM('startup-tips', 'growth-stories', 'product-updates', 'fundraising', 'tech-insights', 'team-building');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_navbar_url" varchar,
  	"sizes_navbar_width" numeric,
  	"sizes_navbar_height" numeric,
  	"sizes_navbar_mime_type" varchar,
  	"sizes_navbar_filesize" numeric,
  	"sizes_navbar_filename" varchar
  );
  
  CREATE TABLE "team_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_team_socials_type" NOT NULL,
  	"url" varchar NOT NULL
  );
  
  CREATE TABLE "team_content" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"point" varchar NOT NULL
  );
  
  CREATE TABLE "team" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"image_id" integer NOT NULL,
  	"bio" varchar NOT NULL,
  	"category" "enum_team_category" NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "releases_changes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"type" "enum_releases_changes_type" NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL
  );
  
  CREATE TABLE "releases" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version" varchar NOT NULL,
  	"date" timestamp(3) with time zone NOT NULL,
  	"summary" varchar NOT NULL,
  	"is_latest" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "contact" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"category" "enum_contact_category" NOT NULL,
  	"message" varchar NOT NULL,
  	"status" "enum_contact_status" DEFAULT 'new',
  	"notes" varchar,
  	"submitted_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "feedback" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"category" "enum_feedback_category" NOT NULL,
  	"feedback_text" varchar NOT NULL,
  	"user_email" varchar,
  	"status" "enum_feedback_status" DEFAULT 'new',
  	"priority" "enum_feedback_priority" DEFAULT 'medium',
  	"internal_notes" varchar,
  	"submitted_at" timestamp(3) with time zone,
  	"added_to_roadmap" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "feedback_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"feedback_id" integer
  );
  
  CREATE TABLE "recent_updates" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"status" "enum_recent_updates_status" NOT NULL,
  	"date" varchar NOT NULL,
  	"order" numeric DEFAULT 0 NOT NULL,
  	"based_on_feedback" boolean DEFAULT false,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "recent_updates_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"feedback_id" integer
  );
  
  CREATE TABLE "bug_reports" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"category" "enum_bug_reports_category" NOT NULL,
  	"priority" "enum_bug_reports_priority" NOT NULL,
  	"steps_to_reproduce" varchar NOT NULL,
  	"expected_behavior" varchar NOT NULL,
  	"actual_behavior" varchar NOT NULL,
  	"additional_information" varchar,
  	"status" "enum_bug_reports_status" DEFAULT 'new',
  	"submitted_at" timestamp(3) with time zone,
  	"internal_notes" varchar,
  	"assigned_to" varchar,
  	"fixed_in_version" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "bug_reports_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"bug_reports_id" integer
  );
  
  CREATE TABLE "waitlist" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"job" "enum_waitlist_job" NOT NULL,
  	"source" "enum_waitlist_source" NOT NULL,
  	"goal" "enum_waitlist_goal" NOT NULL,
  	"status" "enum_waitlist_status" DEFAULT 'pending',
  	"notes" varchar,
  	"submitted_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "newsletter" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"status" "enum_newsletter_status" DEFAULT 'active' NOT NULL,
  	"source" "enum_newsletter_source" DEFAULT 'website_footer',
  	"subscribed_at" timestamp(3) with time zone NOT NULL,
  	"last_sent_at" timestamp(3) with time zone,
  	"preferences_weekly_digest" boolean DEFAULT true,
  	"preferences_product_updates" boolean DEFAULT true,
  	"preferences_events" boolean DEFAULT true,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "spontaneous_applications" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"full_name" varchar,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"preferred_department" "enum_spontaneous_applications_preferred_department" NOT NULL,
  	"current_role" varchar NOT NULL,
  	"years_of_experience" numeric NOT NULL,
  	"social_profiles_linkedin" varchar,
  	"social_profiles_github" varchar,
  	"message" varchar NOT NULL,
  	"resume_id" integer NOT NULL,
  	"status" "enum_spontaneous_applications_status" DEFAULT 'new',
  	"internal_notes" jsonb,
  	"submitted_at" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "resumes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"candidate_name" varchar NOT NULL,
  	"first_name" varchar NOT NULL,
  	"last_name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"position" varchar,
  	"department" varchar,
  	"application_id" integer,
  	"notes" jsonb,
  	"submitted_at" timestamp(3) with time zone,
  	"status" "enum_resumes_status" DEFAULT 'new',
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"display_on_navbar" boolean DEFAULT false,
  	"featured_image_id" integer NOT NULL,
  	"category_id" integer NOT NULL,
  	"author_id" integer,
  	"author_title" varchar,
  	"is_featured" boolean DEFAULT false,
  	"read_time" varchar,
  	"views" numeric DEFAULT 0,
  	"status" "enum_articles_status" DEFAULT 'draft' NOT NULL,
  	"published_at" timestamp(3) with time zone,
  	"seo_og_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "articles_locales" (
  	"title" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar NOT NULL,
  	"content" jsonb NOT NULL,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_keywords" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "articles_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"tags_id" integer,
  	"articles_id" integer
  );
  
  CREATE TABLE "categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"color" varchar,
  	"icon" varchar,
  	"featured_image_id" integer,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "tags" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media_articles" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"caption" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric,
  	"sizes_thumbnail_url" varchar,
  	"sizes_thumbnail_width" numeric,
  	"sizes_thumbnail_height" numeric,
  	"sizes_thumbnail_mime_type" varchar,
  	"sizes_thumbnail_filesize" numeric,
  	"sizes_thumbnail_filename" varchar,
  	"sizes_card_url" varchar,
  	"sizes_card_width" numeric,
  	"sizes_card_height" numeric,
  	"sizes_card_mime_type" varchar,
  	"sizes_card_filesize" numeric,
  	"sizes_card_filename" varchar,
  	"sizes_featured_url" varchar,
  	"sizes_featured_width" numeric,
  	"sizes_featured_height" numeric,
  	"sizes_featured_mime_type" varchar,
  	"sizes_featured_filesize" numeric,
  	"sizes_featured_filename" varchar
  );
  
  CREATE TABLE "article_suggestions_tags" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "article_suggestions_sample_articles" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"url" varchar
  );
  
  CREATE TABLE "article_suggestions" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"email" varchar NOT NULL,
  	"want_to_contribute" boolean DEFAULT false,
  	"want_to_write" boolean DEFAULT false,
  	"writing_experience" varchar,
  	"status" "enum_article_suggestions_status" DEFAULT 'pending' NOT NULL,
  	"admin_notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "article_suggestions_locales" (
  	"title" varchar NOT NULL,
  	"category" "enum_article_suggestions_category" NOT NULL,
  	"description" varchar NOT NULL,
  	"target_audience" varchar,
  	"id" serial PRIMARY KEY NOT NULL,
  	"_locale" "_locales" NOT NULL,
  	"_parent_id" integer NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"team_id" integer,
  	"releases_id" integer,
  	"contact_id" integer,
  	"feedback_id" integer,
  	"recent_updates_id" integer,
  	"bug_reports_id" integer,
  	"waitlist_id" integer,
  	"newsletter_id" integer,
  	"spontaneous_applications_id" integer,
  	"resumes_id" integer,
  	"articles_id" integer,
  	"categories_id" integer,
  	"tags_id" integer,
  	"media_articles_id" integer,
  	"article_suggestions_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_socials" ADD CONSTRAINT "team_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_content" ADD CONSTRAINT "team_content_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team" ADD CONSTRAINT "team_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "releases_changes" ADD CONSTRAINT "releases_changes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "feedback_rels" ADD CONSTRAINT "feedback_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "feedback_rels" ADD CONSTRAINT "feedback_rels_feedback_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recent_updates_rels" ADD CONSTRAINT "recent_updates_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."recent_updates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "recent_updates_rels" ADD CONSTRAINT "recent_updates_rels_feedback_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bug_reports_rels" ADD CONSTRAINT "bug_reports_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."bug_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "bug_reports_rels" ADD CONSTRAINT "bug_reports_rels_bug_reports_fk" FOREIGN KEY ("bug_reports_id") REFERENCES "public"."bug_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "spontaneous_applications" ADD CONSTRAINT "spontaneous_applications_resume_id_media_id_fk" FOREIGN KEY ("resume_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "resumes" ADD CONSTRAINT "resumes_application_id_spontaneous_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."spontaneous_applications"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_featured_image_id_media_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_author_id_team_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."team"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles" ADD CONSTRAINT "articles_seo_og_image_id_media_id_fk" FOREIGN KEY ("seo_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "articles_locales" ADD CONSTRAINT "articles_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "articles_rels" ADD CONSTRAINT "articles_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "categories" ADD CONSTRAINT "categories_featured_image_id_media_articles_id_fk" FOREIGN KEY ("featured_image_id") REFERENCES "public"."media_articles"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "article_suggestions_tags" ADD CONSTRAINT "article_suggestions_tags_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."article_suggestions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_suggestions_sample_articles" ADD CONSTRAINT "article_suggestions_sample_articles_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."article_suggestions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "article_suggestions_locales" ADD CONSTRAINT "article_suggestions_locales_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."article_suggestions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_releases_fk" FOREIGN KEY ("releases_id") REFERENCES "public"."releases"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_contact_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contact"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_feedback_fk" FOREIGN KEY ("feedback_id") REFERENCES "public"."feedback"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_recent_updates_fk" FOREIGN KEY ("recent_updates_id") REFERENCES "public"."recent_updates"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_bug_reports_fk" FOREIGN KEY ("bug_reports_id") REFERENCES "public"."bug_reports"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_waitlist_fk" FOREIGN KEY ("waitlist_id") REFERENCES "public"."waitlist"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_newsletter_fk" FOREIGN KEY ("newsletter_id") REFERENCES "public"."newsletter"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_spontaneous_applications_fk" FOREIGN KEY ("spontaneous_applications_id") REFERENCES "public"."spontaneous_applications"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_resumes_fk" FOREIGN KEY ("resumes_id") REFERENCES "public"."resumes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_articles_fk" FOREIGN KEY ("articles_id") REFERENCES "public"."articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_categories_fk" FOREIGN KEY ("categories_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_tags_fk" FOREIGN KEY ("tags_id") REFERENCES "public"."tags"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_articles_fk" FOREIGN KEY ("media_articles_id") REFERENCES "public"."media_articles"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_article_suggestions_fk" FOREIGN KEY ("article_suggestions_id") REFERENCES "public"."article_suggestions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE INDEX "media_sizes_navbar_sizes_navbar_filename_idx" ON "media" USING btree ("sizes_navbar_filename");
  CREATE INDEX "team_socials_order_idx" ON "team_socials" USING btree ("_order");
  CREATE INDEX "team_socials_parent_id_idx" ON "team_socials" USING btree ("_parent_id");
  CREATE INDEX "team_content_order_idx" ON "team_content" USING btree ("_order");
  CREATE INDEX "team_content_parent_id_idx" ON "team_content" USING btree ("_parent_id");
  CREATE INDEX "team_image_idx" ON "team" USING btree ("image_id");
  CREATE INDEX "team_updated_at_idx" ON "team" USING btree ("updated_at");
  CREATE INDEX "team_created_at_idx" ON "team" USING btree ("created_at");
  CREATE INDEX "releases_changes_order_idx" ON "releases_changes" USING btree ("_order");
  CREATE INDEX "releases_changes_parent_id_idx" ON "releases_changes" USING btree ("_parent_id");
  CREATE INDEX "releases_updated_at_idx" ON "releases" USING btree ("updated_at");
  CREATE INDEX "releases_created_at_idx" ON "releases" USING btree ("created_at");
  CREATE INDEX "contact_updated_at_idx" ON "contact" USING btree ("updated_at");
  CREATE INDEX "contact_created_at_idx" ON "contact" USING btree ("created_at");
  CREATE INDEX "feedback_updated_at_idx" ON "feedback" USING btree ("updated_at");
  CREATE INDEX "feedback_created_at_idx" ON "feedback" USING btree ("created_at");
  CREATE INDEX "feedback_rels_order_idx" ON "feedback_rels" USING btree ("order");
  CREATE INDEX "feedback_rels_parent_idx" ON "feedback_rels" USING btree ("parent_id");
  CREATE INDEX "feedback_rels_path_idx" ON "feedback_rels" USING btree ("path");
  CREATE INDEX "feedback_rels_feedback_id_idx" ON "feedback_rels" USING btree ("feedback_id");
  CREATE INDEX "recent_updates_updated_at_idx" ON "recent_updates" USING btree ("updated_at");
  CREATE INDEX "recent_updates_created_at_idx" ON "recent_updates" USING btree ("created_at");
  CREATE INDEX "recent_updates_rels_order_idx" ON "recent_updates_rels" USING btree ("order");
  CREATE INDEX "recent_updates_rels_parent_idx" ON "recent_updates_rels" USING btree ("parent_id");
  CREATE INDEX "recent_updates_rels_path_idx" ON "recent_updates_rels" USING btree ("path");
  CREATE INDEX "recent_updates_rels_feedback_id_idx" ON "recent_updates_rels" USING btree ("feedback_id");
  CREATE INDEX "bug_reports_updated_at_idx" ON "bug_reports" USING btree ("updated_at");
  CREATE INDEX "bug_reports_created_at_idx" ON "bug_reports" USING btree ("created_at");
  CREATE INDEX "bug_reports_rels_order_idx" ON "bug_reports_rels" USING btree ("order");
  CREATE INDEX "bug_reports_rels_parent_idx" ON "bug_reports_rels" USING btree ("parent_id");
  CREATE INDEX "bug_reports_rels_path_idx" ON "bug_reports_rels" USING btree ("path");
  CREATE INDEX "bug_reports_rels_bug_reports_id_idx" ON "bug_reports_rels" USING btree ("bug_reports_id");
  CREATE UNIQUE INDEX "waitlist_email_idx" ON "waitlist" USING btree ("email");
  CREATE INDEX "waitlist_job_idx" ON "waitlist" USING btree ("job");
  CREATE INDEX "waitlist_status_idx" ON "waitlist" USING btree ("status");
  CREATE INDEX "waitlist_submitted_at_idx" ON "waitlist" USING btree ("submitted_at");
  CREATE INDEX "waitlist_updated_at_idx" ON "waitlist" USING btree ("updated_at");
  CREATE INDEX "waitlist_created_at_idx" ON "waitlist" USING btree ("created_at");
  CREATE UNIQUE INDEX "newsletter_email_idx" ON "newsletter" USING btree ("email");
  CREATE INDEX "newsletter_status_idx" ON "newsletter" USING btree ("status");
  CREATE INDEX "newsletter_updated_at_idx" ON "newsletter" USING btree ("updated_at");
  CREATE INDEX "newsletter_created_at_idx" ON "newsletter" USING btree ("created_at");
  CREATE UNIQUE INDEX "spontaneous_applications_email_idx" ON "spontaneous_applications" USING btree ("email");
  CREATE INDEX "spontaneous_applications_resume_idx" ON "spontaneous_applications" USING btree ("resume_id");
  CREATE INDEX "spontaneous_applications_updated_at_idx" ON "spontaneous_applications" USING btree ("updated_at");
  CREATE INDEX "spontaneous_applications_created_at_idx" ON "spontaneous_applications" USING btree ("created_at");
  CREATE INDEX "resumes_application_idx" ON "resumes" USING btree ("application_id");
  CREATE INDEX "resumes_updated_at_idx" ON "resumes" USING btree ("updated_at");
  CREATE INDEX "resumes_created_at_idx" ON "resumes" USING btree ("created_at");
  CREATE UNIQUE INDEX "resumes_filename_idx" ON "resumes" USING btree ("filename");
  CREATE INDEX "articles_featured_image_idx" ON "articles" USING btree ("featured_image_id");
  CREATE INDEX "articles_category_idx" ON "articles" USING btree ("category_id");
  CREATE INDEX "articles_author_idx" ON "articles" USING btree ("author_id");
  CREATE INDEX "articles_seo_seo_og_image_idx" ON "articles" USING btree ("seo_og_image_id");
  CREATE INDEX "articles_updated_at_idx" ON "articles" USING btree ("updated_at");
  CREATE INDEX "articles_created_at_idx" ON "articles" USING btree ("created_at");
  CREATE UNIQUE INDEX "articles_slug_idx" ON "articles_locales" USING btree ("slug","_locale");
  CREATE UNIQUE INDEX "articles_locales_locale_parent_id_unique" ON "articles_locales" USING btree ("_locale","_parent_id");
  CREATE INDEX "articles_rels_order_idx" ON "articles_rels" USING btree ("order");
  CREATE INDEX "articles_rels_parent_idx" ON "articles_rels" USING btree ("parent_id");
  CREATE INDEX "articles_rels_path_idx" ON "articles_rels" USING btree ("path");
  CREATE INDEX "articles_rels_tags_id_idx" ON "articles_rels" USING btree ("tags_id");
  CREATE INDEX "articles_rels_articles_id_idx" ON "articles_rels" USING btree ("articles_id");
  CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");
  CREATE INDEX "categories_featured_image_idx" ON "categories" USING btree ("featured_image_id");
  CREATE INDEX "categories_updated_at_idx" ON "categories" USING btree ("updated_at");
  CREATE INDEX "categories_created_at_idx" ON "categories" USING btree ("created_at");
  CREATE UNIQUE INDEX "tags_slug_idx" ON "tags" USING btree ("slug");
  CREATE INDEX "tags_updated_at_idx" ON "tags" USING btree ("updated_at");
  CREATE INDEX "tags_created_at_idx" ON "tags" USING btree ("created_at");
  CREATE INDEX "media_articles_updated_at_idx" ON "media_articles" USING btree ("updated_at");
  CREATE INDEX "media_articles_created_at_idx" ON "media_articles" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_articles_filename_idx" ON "media_articles" USING btree ("filename");
  CREATE INDEX "media_articles_sizes_thumbnail_sizes_thumbnail_filename_idx" ON "media_articles" USING btree ("sizes_thumbnail_filename");
  CREATE INDEX "media_articles_sizes_card_sizes_card_filename_idx" ON "media_articles" USING btree ("sizes_card_filename");
  CREATE INDEX "media_articles_sizes_featured_sizes_featured_filename_idx" ON "media_articles" USING btree ("sizes_featured_filename");
  CREATE INDEX "article_suggestions_tags_order_idx" ON "article_suggestions_tags" USING btree ("_order");
  CREATE INDEX "article_suggestions_tags_parent_id_idx" ON "article_suggestions_tags" USING btree ("_parent_id");
  CREATE INDEX "article_suggestions_sample_articles_order_idx" ON "article_suggestions_sample_articles" USING btree ("_order");
  CREATE INDEX "article_suggestions_sample_articles_parent_id_idx" ON "article_suggestions_sample_articles" USING btree ("_parent_id");
  CREATE INDEX "article_suggestions_updated_at_idx" ON "article_suggestions" USING btree ("updated_at");
  CREATE INDEX "article_suggestions_created_at_idx" ON "article_suggestions" USING btree ("created_at");
  CREATE UNIQUE INDEX "article_suggestions_locales_locale_parent_id_unique" ON "article_suggestions_locales" USING btree ("_locale","_parent_id");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_team_id_idx" ON "payload_locked_documents_rels" USING btree ("team_id");
  CREATE INDEX "payload_locked_documents_rels_releases_id_idx" ON "payload_locked_documents_rels" USING btree ("releases_id");
  CREATE INDEX "payload_locked_documents_rels_contact_id_idx" ON "payload_locked_documents_rels" USING btree ("contact_id");
  CREATE INDEX "payload_locked_documents_rels_feedback_id_idx" ON "payload_locked_documents_rels" USING btree ("feedback_id");
  CREATE INDEX "payload_locked_documents_rels_recent_updates_id_idx" ON "payload_locked_documents_rels" USING btree ("recent_updates_id");
  CREATE INDEX "payload_locked_documents_rels_bug_reports_id_idx" ON "payload_locked_documents_rels" USING btree ("bug_reports_id");
  CREATE INDEX "payload_locked_documents_rels_waitlist_id_idx" ON "payload_locked_documents_rels" USING btree ("waitlist_id");
  CREATE INDEX "payload_locked_documents_rels_newsletter_id_idx" ON "payload_locked_documents_rels" USING btree ("newsletter_id");
  CREATE INDEX "payload_locked_documents_rels_spontaneous_applications_i_idx" ON "payload_locked_documents_rels" USING btree ("spontaneous_applications_id");
  CREATE INDEX "payload_locked_documents_rels_resumes_id_idx" ON "payload_locked_documents_rels" USING btree ("resumes_id");
  CREATE INDEX "payload_locked_documents_rels_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("articles_id");
  CREATE INDEX "payload_locked_documents_rels_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("categories_id");
  CREATE INDEX "payload_locked_documents_rels_tags_id_idx" ON "payload_locked_documents_rels" USING btree ("tags_id");
  CREATE INDEX "payload_locked_documents_rels_media_articles_id_idx" ON "payload_locked_documents_rels" USING btree ("media_articles_id");
  CREATE INDEX "payload_locked_documents_rels_article_suggestions_id_idx" ON "payload_locked_documents_rels" USING btree ("article_suggestions_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "team_socials" CASCADE;
  DROP TABLE "team_content" CASCADE;
  DROP TABLE "team" CASCADE;
  DROP TABLE "releases_changes" CASCADE;
  DROP TABLE "releases" CASCADE;
  DROP TABLE "contact" CASCADE;
  DROP TABLE "feedback" CASCADE;
  DROP TABLE "feedback_rels" CASCADE;
  DROP TABLE "recent_updates" CASCADE;
  DROP TABLE "recent_updates_rels" CASCADE;
  DROP TABLE "bug_reports" CASCADE;
  DROP TABLE "bug_reports_rels" CASCADE;
  DROP TABLE "waitlist" CASCADE;
  DROP TABLE "newsletter" CASCADE;
  DROP TABLE "spontaneous_applications" CASCADE;
  DROP TABLE "resumes" CASCADE;
  DROP TABLE "articles" CASCADE;
  DROP TABLE "articles_locales" CASCADE;
  DROP TABLE "articles_rels" CASCADE;
  DROP TABLE "categories" CASCADE;
  DROP TABLE "tags" CASCADE;
  DROP TABLE "media_articles" CASCADE;
  DROP TABLE "article_suggestions_tags" CASCADE;
  DROP TABLE "article_suggestions_sample_articles" CASCADE;
  DROP TABLE "article_suggestions" CASCADE;
  DROP TABLE "article_suggestions_locales" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."_locales";
  DROP TYPE "public"."enum_team_socials_type";
  DROP TYPE "public"."enum_team_category";
  DROP TYPE "public"."enum_releases_changes_type";
  DROP TYPE "public"."enum_contact_category";
  DROP TYPE "public"."enum_contact_status";
  DROP TYPE "public"."enum_feedback_category";
  DROP TYPE "public"."enum_feedback_status";
  DROP TYPE "public"."enum_feedback_priority";
  DROP TYPE "public"."enum_recent_updates_status";
  DROP TYPE "public"."enum_bug_reports_category";
  DROP TYPE "public"."enum_bug_reports_priority";
  DROP TYPE "public"."enum_bug_reports_status";
  DROP TYPE "public"."enum_waitlist_job";
  DROP TYPE "public"."enum_waitlist_source";
  DROP TYPE "public"."enum_waitlist_goal";
  DROP TYPE "public"."enum_waitlist_status";
  DROP TYPE "public"."enum_newsletter_status";
  DROP TYPE "public"."enum_newsletter_source";
  DROP TYPE "public"."enum_spontaneous_applications_preferred_department";
  DROP TYPE "public"."enum_spontaneous_applications_status";
  DROP TYPE "public"."enum_resumes_status";
  DROP TYPE "public"."enum_articles_status";
  DROP TYPE "public"."enum_article_suggestions_status";
  DROP TYPE "public"."enum_article_suggestions_category";`)
}
