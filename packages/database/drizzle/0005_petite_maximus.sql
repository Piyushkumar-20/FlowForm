CREATE TYPE "public"."form_status" AS ENUM('draft', 'published', 'unpublished');--> statement-breakpoint
CREATE TYPE "public"."form_visibility" AS ENUM('public', 'unlisted');--> statement-breakpoint
ALTER TYPE "public"."field_type_enum" ADD VALUE 'SELECT';--> statement-breakpoint
ALTER TYPE "public"."field_type_enum" ADD VALUE 'CHECKBOX';--> statement-breakpoint
ALTER TYPE "public"."field_type_enum" ADD VALUE 'RATING';--> statement-breakpoint
ALTER TYPE "public"."field_type_enum" ADD VALUE 'DATE';--> statement-breakpoint
ALTER TABLE "form_field" ADD COLUMN "options" json;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "status" "form_status" DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "forms" ADD COLUMN "visibility" "form_visibility" DEFAULT 'public' NOT NULL;