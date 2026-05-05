CREATE TYPE "public"."actor_type" AS ENUM('admin', 'member', 'system');--> statement-breakpoint
CREATE TYPE "public"."approval_action" AS ENUM('approved', 'rejected', 'returned', 'assigned', 'noted', 'completed');--> statement-breakpoint
CREATE TYPE "public"."audit_action" AS ENUM('form_created', 'form_updated', 'form_deleted', 'form_published', 'form_archived', 'field_added', 'field_updated', 'field_deleted', 'field_reordered', 'step_added', 'step_updated', 'step_deleted', 'workflow_created', 'workflow_updated', 'workflow_deleted', 'submission_created', 'submission_approved', 'submission_rejected', 'submission_returned', 'submission_completed', 'submission_noted', 'other');--> statement-breakpoint
CREATE TYPE "public"."entity_type" AS ENUM('form', 'field', 'step', 'workflow', 'submission', 'notification');--> statement-breakpoint
CREATE TYPE "public"."field_type" AS ENUM('text', 'number', 'email', 'phone', 'password', 'textarea', 'dropdown', 'radio', 'checkbox', 'multiselect', 'date', 'time', 'datetime', 'file', 'image', 'document', 'currency', 'address', 'gps', 'signature', 'url', 'color', 'member_selector', 'product_selector', 'loan_selector', 'saving_selector', 'share_selector');--> statement-breakpoint
CREATE TYPE "public"."form_status" AS ENUM('draft', 'published', 'archived', 'unpublished');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('submission_created', 'submission_approved', 'submission_rejected', 'submission_returned', 'submission_completed', 'new_submission', 'reminder');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('draft', 'submitted', 'pending', 'approved', 'rejected', 'processing', 'completed');--> statement-breakpoint
CREATE TABLE "contact_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(100),
	"phone" varchar(15) NOT NULL,
	"subject" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"status" varchar(50) DEFAULT 'unread' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "downloads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ne" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	"file_key" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ne" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	"image_key" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "hero_slides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"image_url" text NOT NULL,
	"blur_data_url" text,
	"title_en" text,
	"title_ne" text,
	"subtitle_en" text,
	"subtitle_ne" text,
	"cta_text_en" text,
	"cta_text_ne" text,
	"cta_link" text,
	"overlay_opacity" integer DEFAULT 50 NOT NULL,
	"text_position" varchar(20) DEFAULT 'left' NOT NULL,
	"duration" integer DEFAULT 5 NOT NULL,
	"start_at" timestamp,
	"end_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "member_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid,
	"document_type" varchar(50) NOT NULL,
	"document_number" varchar(100),
	"file_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "member_relations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid,
	"related_member_id" uuid,
	"relation_type" varchar(50),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_code" varchar(20),
	"first_name" varchar(100) NOT NULL,
	"middle_name" varchar(100),
	"last_name" varchar(100) NOT NULL,
	"full_name" varchar(255),
	"first_name_nepali" varchar(100),
	"last_name_nepali" varchar(100),
	"gender" varchar(10),
	"date_of_birth" date,
	"citizenship_no" varchar(50),
	"citizenship_issue_district" varchar(100),
	"citizenship_issue_date" date,
	"mobile_no" varchar(20) NOT NULL,
	"alt_mobile_no" varchar(20),
	"email" varchar(100),
	"province" varchar(50),
	"district" varchar(100),
	"municipality" varchar(100),
	"ward_no" integer,
	"tole" varchar(100),
	"temp_province" varchar(50),
	"temp_district" varchar(100),
	"temp_municipality" varchar(100),
	"temp_ward_no" integer,
	"temp_tole" varchar(100),
	"father_name" varchar(255),
	"grandfather_name" varchar(255),
	"spouse_name" varchar(255),
	"occupation" varchar(100),
	"monthly_income" numeric(12, 2),
	"join_date" date,
	"member_type" varchar(50),
	"status" varchar(20) DEFAULT 'pending',
	"approval_date" timestamp,
	"approved_by" uuid,
	"rejection_reason" text,
	"photo_url" text,
	"citizenship_front_url" text,
	"citizenship_back_url" text,
	"signature_url" text,
	"nominee_name" varchar(255),
	"nominee_relation" varchar(100),
	"nominee_contact" varchar(20),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "members_member_code_unique" UNIQUE("member_code")
);
--> statement-breakpoint
CREATE TABLE "nav_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label_en" varchar(100) NOT NULL,
	"label_ne" varchar(100) NOT NULL,
	"href" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "news_ticker" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content_en" text NOT NULL,
	"content_ne" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"email_sent_count" integer DEFAULT 0 NOT NULL,
	"last_email_sent_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"subscribed_at" timestamp DEFAULT now(),
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "notices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_en" text NOT NULL,
	"title_ne" text NOT NULL,
	"desc_en" text NOT NULL,
	"desc_ne" text NOT NULL,
	"content_en" text NOT NULL,
	"content_ne" text NOT NULL,
	"tag_en" varchar(50) NOT NULL,
	"tag_ne" varchar(50) NOT NULL,
	"category" varchar(50) NOT NULL,
	"date" timestamp NOT NULL,
	"image_key" text
);
--> statement-breakpoint
CREATE TABLE "public_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"address" text,
	"citizenship_no" text,
	"citizenship_front_url" text,
	"citizenship_back_url" text,
	"password_hash" text,
	"reset_token" text,
	"reset_token_expiry" timestamp,
	"status" varchar(20) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "public_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ne" varchar(255) NOT NULL,
	"desc_en" text NOT NULL,
	"desc_ne" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"icon" varchar(50) NOT NULL,
	"image_key" text,
	"features_en" json,
	"features_ne" json
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"key" varchar(100) PRIMARY KEY NOT NULL,
	"value" text DEFAULT '' NOT NULL,
	"label" varchar(200) NOT NULL,
	"group" varchar(50) NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "site_stats" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"value" varchar(50) NOT NULL,
	"label_en" varchar(100) NOT NULL,
	"label_ne" varchar(100) NOT NULL,
	"icon" varchar(50) DEFAULT 'TrendingUp',
	"color" varchar(30) DEFAULT '#1a6b3c',
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform" varchar(50) NOT NULL,
	"url" text DEFAULT '#' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "social_links_platform_unique" UNIQUE("platform")
);
--> statement-breakpoint
CREATE TABLE "system_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar(256),
	"name" text DEFAULT 'System User' NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" text,
	"role" varchar(50) DEFAULT 'staff' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "system_users_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "system_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name_en" varchar(100) NOT NULL,
	"name_ne" varchar(100) NOT NULL,
	"role_en" varchar(100) NOT NULL,
	"role_ne" varchar(100) NOT NULL,
	"department" varchar(50) NOT NULL,
	"bio_en" text NOT NULL,
	"bio_ne" text NOT NULL,
	"education_en" varchar(255),
	"education_ne" varchar(255),
	"experience_en" json,
	"experience_ne" json,
	"expertise_en" json,
	"expertise_ne" json,
	"image_key" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approval_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"step_id" uuid,
	"action" "approval_action" NOT NULL,
	"remarks" text,
	"approved_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approval_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"workflow_id" uuid NOT NULL,
	"role_label" varchar(100) NOT NULL,
	"step_order" integer NOT NULL,
	"sla_hours" integer DEFAULT 48,
	"escalation_after_hours" integer DEFAULT 72,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approval_workflows" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid,
	"workflow_name" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_id" uuid,
	"actor_type" "actor_type" DEFAULT 'admin' NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" uuid,
	"action" "audit_action" NOT NULL,
	"before_json" jsonb,
	"after_json" jsonb,
	"ip_address" varchar(45),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"step_id" uuid,
	"label" varchar(255) NOT NULL,
	"label_ne" varchar(255),
	"field_name" varchar(100) NOT NULL,
	"field_type" "field_type" NOT NULL,
	"placeholder" varchar(255),
	"help_text" text,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"is_readonly" boolean DEFAULT false NOT NULL,
	"default_value" text,
	"options_json" jsonb,
	"validation_json" jsonb,
	"conditional_logic_json" jsonb,
	"permissions_json" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"title" varchar(255) NOT NULL,
	"title_ne" varchar(255),
	"description" text,
	"step_order" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_submissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"member_id" uuid,
	"submission_code" varchar(50) NOT NULL,
	"status" "submission_status" DEFAULT 'draft' NOT NULL,
	"schema_snapshot" jsonb,
	"version_id" uuid,
	"workflow_id" uuid,
	"current_step" integer DEFAULT 0,
	"assigned_to" uuid,
	"due_at" timestamp with time zone,
	"submitted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "form_submissions_submission_code_unique" UNIQUE("submission_code")
);
--> statement-breakpoint
CREATE TABLE "form_versions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"form_id" uuid NOT NULL,
	"version" integer NOT NULL,
	"snapshot_json" jsonb NOT NULL,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" uuid
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"category" varchar(50) DEFAULT 'custom' NOT NULL,
	"status" "form_status" DEFAULT 'draft' NOT NULL,
	"access_type" varchar(30) DEFAULT 'members_only' NOT NULL,
	"allowed_roles_json" jsonb,
	"allowed_groups_json" jsonb,
	"is_multi_step" boolean DEFAULT false NOT NULL,
	"current_version" integer DEFAULT 1 NOT NULL,
	"rate_limit_per_minute" integer DEFAULT 0 NOT NULL,
	"rate_limit_per_day" integer DEFAULT 0 NOT NULL,
	"start_at" timestamp with time zone,
	"end_at" timestamp with time zone,
	"is_archived" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "forms_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid,
	"admin_id" uuid,
	"type" "notification_type" NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text,
	"payload_json" jsonb,
	"link" text,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "notification_single_receiver" CHECK ((
      ("member_id" IS NOT NULL AND "admin_id" IS NULL)
      OR
      ("member_id" IS NULL AND "admin_id" IS NOT NULL)
    ))
);
--> statement-breakpoint
CREATE TABLE "submission_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"field_id" uuid,
	"field_name" varchar(100) NOT NULL,
	"storage_path" text NOT NULL,
	"public_url" text,
	"file_name" varchar(255) NOT NULL,
	"mime_type" varchar(100) NOT NULL,
	"size_bytes" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "submission_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"submission_id" uuid NOT NULL,
	"field_id" uuid,
	"field_name" varchar(100) NOT NULL,
	"value_text" text,
	"value_json" jsonb,
	"value_number" numeric(18, 4),
	"value_boolean" boolean,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "member_documents" ADD CONSTRAINT "member_documents_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_relations" ADD CONSTRAINT "member_relations_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_relations" ADD CONSTRAINT "member_relations_related_member_id_members_id_fk" FOREIGN KEY ("related_member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "members" ADD CONSTRAINT "members_approved_by_system_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."system_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_logs" ADD CONSTRAINT "approval_logs_submission_id_form_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_logs" ADD CONSTRAINT "approval_logs_step_id_approval_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."approval_steps"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_logs" ADD CONSTRAINT "approval_logs_approved_by_system_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."system_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_steps" ADD CONSTRAINT "approval_steps_workflow_id_approval_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."approval_workflows"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_workflows" ADD CONSTRAINT "approval_workflows_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approval_workflows" ADD CONSTRAINT "approval_workflows_created_by_system_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."system_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_fields" ADD CONSTRAINT "form_fields_step_id_form_steps_id_fk" FOREIGN KEY ("step_id") REFERENCES "public"."form_steps"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_steps" ADD CONSTRAINT "form_steps_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_member_id_public_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."public_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_version_id_form_versions_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."form_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_workflow_id_approval_workflows_id_fk" FOREIGN KEY ("workflow_id") REFERENCES "public"."approval_workflows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_submissions" ADD CONSTRAINT "form_submissions_assigned_to_system_users_id_fk" FOREIGN KEY ("assigned_to") REFERENCES "public"."system_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_versions" ADD CONSTRAINT "form_versions_form_id_forms_id_fk" FOREIGN KEY ("form_id") REFERENCES "public"."forms"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "form_versions" ADD CONSTRAINT "form_versions_created_by_system_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."system_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_created_by_system_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."system_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_member_id_public_users_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."public_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_admin_id_system_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."system_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_submission_id_form_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_files" ADD CONSTRAINT "submission_files_field_id_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."form_fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_values" ADD CONSTRAINT "submission_values_submission_id_form_submissions_id_fk" FOREIGN KEY ("submission_id") REFERENCES "public"."form_submissions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submission_values" ADD CONSTRAINT "submission_values_field_id_form_fields_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."form_fields"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_msgs_created_at_idx" ON "contact_messages" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "downloads_created_at_idx" ON "downloads" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "gallery_created_at_idx" ON "gallery" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "hero_slides_created_at_idx" ON "hero_slides" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "members_created_at_idx" ON "members" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "news_ticker_created_at_idx" ON "news_ticker" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "notices_date_idx" ON "notices" USING btree ("date");--> statement-breakpoint
CREATE INDEX "approval_logs_submission_idx" ON "approval_logs" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "approval_steps_workflow_idx" ON "approval_steps" USING btree ("workflow_id","step_order");--> statement-breakpoint
CREATE UNIQUE INDEX "approval_step_unique" ON "approval_steps" USING btree ("workflow_id","step_order");--> statement-breakpoint
CREATE INDEX "workflows_form_idx" ON "approval_workflows" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "audit_entity_idx" ON "audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "audit_actor_idx" ON "audit_logs" USING btree ("actor_id");--> statement-breakpoint
CREATE INDEX "audit_created_idx" ON "audit_logs" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "form_fields_form_sort_idx" ON "form_fields" USING btree ("form_id","sort_order");--> statement-breakpoint
CREATE INDEX "form_fields_deleted_idx" ON "form_fields" USING btree ("deleted_at");--> statement-breakpoint
CREATE UNIQUE INDEX "field_name_per_form_unique" ON "form_fields" USING btree ("form_id","field_name");--> statement-breakpoint
CREATE INDEX "form_steps_form_idx" ON "form_steps" USING btree ("form_id","step_order");--> statement-breakpoint
CREATE UNIQUE INDEX "step_order_per_form_unique" ON "form_steps" USING btree ("form_id","step_order");--> statement-breakpoint
CREATE INDEX "submissions_form_idx" ON "form_submissions" USING btree ("form_id");--> statement-breakpoint
CREATE INDEX "submissions_member_idx" ON "form_submissions" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "submissions_status_idx" ON "form_submissions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "submissions_code_idx" ON "form_submissions" USING btree ("submission_code");--> statement-breakpoint
CREATE INDEX "submissions_created_idx" ON "form_submissions" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "submissions_step_idx" ON "form_submissions" USING btree ("current_step");--> statement-breakpoint
CREATE INDEX "submission_form_status_idx" ON "form_submissions" USING btree ("form_id","status");--> statement-breakpoint
CREATE INDEX "submission_member_created_idx" ON "form_submissions" USING btree ("member_id","created_at");--> statement-breakpoint
CREATE INDEX "form_versions_form_idx" ON "form_versions" USING btree ("form_id");--> statement-breakpoint
CREATE UNIQUE INDEX "form_version_unique" ON "form_versions" USING btree ("form_id","version");--> statement-breakpoint
CREATE INDEX "forms_status_idx" ON "forms" USING btree ("status");--> statement-breakpoint
CREATE INDEX "forms_category_idx" ON "forms" USING btree ("category");--> statement-breakpoint
CREATE INDEX "forms_deleted_idx" ON "forms" USING btree ("deleted_at");--> statement-breakpoint
CREATE INDEX "forms_published_idx" ON "forms" USING btree ("published_at");--> statement-breakpoint
CREATE INDEX "notifications_member_idx" ON "notifications" USING btree ("member_id");--> statement-breakpoint
CREATE INDEX "notifications_admin_idx" ON "notifications" USING btree ("admin_id");--> statement-breakpoint
CREATE INDEX "notifications_read_idx" ON "notifications" USING btree ("read_at");--> statement-breakpoint
CREATE INDEX "notifications_unread_member_idx" ON "notifications" USING btree ("member_id","read_at");--> statement-breakpoint
CREATE INDEX "sub_files_submission_idx" ON "submission_files" USING btree ("submission_id");--> statement-breakpoint
CREATE INDEX "sub_values_submission_idx" ON "submission_values" USING btree ("submission_id");