ALTER TABLE "rides" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "archived_by" uuid;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "archive_reason" text;--> statement-breakpoint
ALTER TABLE "rides" ADD CONSTRAINT "rides_archived_by_users_id_fk" FOREIGN KEY ("archived_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;