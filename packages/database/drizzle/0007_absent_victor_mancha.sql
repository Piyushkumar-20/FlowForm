ALTER TABLE "form_field" ADD COLUMN "page" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "form_field" ADD COLUMN "conditions" json;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "is_archived" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "slug" varchar(100);--> statement-breakpoint
ALTER TABLE "forms" ADD CONSTRAINT "forms_slug_unique" UNIQUE("slug");