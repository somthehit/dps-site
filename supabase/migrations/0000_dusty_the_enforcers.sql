CREATE TABLE "contact_messages" (
	"id" serial PRIMARY KEY NOT NULL,
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
	"id" serial PRIMARY KEY NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ne" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	"file_url" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gallery" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ne" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	"image_url" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "kyc_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"member_id" serial NOT NULL,
	"document_type" varchar(50) NOT NULL,
	"file_url" text NOT NULL,
	"uploaded_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(256),
	"full_name" text NOT NULL,
	"phone" varchar(15) NOT NULL,
	"address" text,
	"is_approved" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "members_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE "nav_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"label_en" varchar(100) NOT NULL,
	"label_ne" varchar(100) NOT NULL,
	"href" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notices" (
	"id" serial PRIMARY KEY NOT NULL,
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
	"image_url" text
);
--> statement-breakpoint
CREATE TABLE "services" (
	"id" serial PRIMARY KEY NOT NULL,
	"title_en" varchar(255) NOT NULL,
	"title_ne" varchar(255) NOT NULL,
	"desc_en" text NOT NULL,
	"desc_ne" text NOT NULL,
	"category" varchar(50) NOT NULL,
	"icon" varchar(50) NOT NULL,
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
	"id" serial PRIMARY KEY NOT NULL,
	"value" varchar(50) NOT NULL,
	"label_en" varchar(100) NOT NULL,
	"label_ne" varchar(100) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_links" (
	"id" serial PRIMARY KEY NOT NULL,
	"platform" varchar(50) NOT NULL,
	"url" text DEFAULT '#' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "social_links_platform_unique" UNIQUE("platform")
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
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
	"image_url" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "kyc_documents" ADD CONSTRAINT "kyc_documents_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE no action ON UPDATE no action;