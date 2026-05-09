CREATE TYPE "public"."ride_lifecycle_event_type" AS ENUM('CREATED', 'STATUS_CHANGED', 'PAYMENT_STATUS_CHANGED', 'ARCHIVED', 'RESTORED');--> statement-breakpoint
ALTER TYPE "public"."transaction_origin" ADD VALUE 'RIDE_ARCHIVE_REFUND' BEFORE 'MANUAL_ADJUSTMENT';--> statement-breakpoint
ALTER TYPE "public"."transaction_origin" ADD VALUE 'RIDE_RESTORE_USAGE' BEFORE 'MANUAL_ADJUSTMENT';--> statement-breakpoint
CREATE TABLE "ride_lifecycle_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ride_id" uuid NOT NULL,
	"ride_user_id" uuid NOT NULL,
	"actor_user_id" uuid,
	"event_type" "ride_lifecycle_event_type" NOT NULL,
	"previous_status" "ride_status",
	"next_status" "ride_status",
	"previous_payment_status" "payment_status",
	"next_payment_status" "payment_status",
	"metadata_json" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ride_lifecycle_events" ADD CONSTRAINT "ride_lifecycle_events_ride_id_rides_id_fk" FOREIGN KEY ("ride_id") REFERENCES "public"."rides"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ride_lifecycle_events" ADD CONSTRAINT "ride_lifecycle_events_ride_user_id_users_id_fk" FOREIGN KEY ("ride_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ride_lifecycle_events" ADD CONSTRAINT "ride_lifecycle_events_actor_user_id_users_id_fk" FOREIGN KEY ("actor_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ride_lifecycle_events_ride_id_idx" ON "ride_lifecycle_events" USING btree ("ride_id","created_at");--> statement-breakpoint
CREATE INDEX "ride_lifecycle_events_ride_user_id_idx" ON "ride_lifecycle_events" USING btree ("ride_user_id","created_at");