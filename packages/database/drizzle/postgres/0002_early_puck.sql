ALTER TABLE "subscriptions" ADD COLUMN "trial_started_at" timestamp with time zone;--> statement-breakpoint
UPDATE "subscriptions"
SET "trial_started_at" = "users"."created_at"
FROM "users"
WHERE "users"."id" = "subscriptions"."user_id"
  AND "subscriptions"."plan" = 'starter'
  AND "subscriptions"."trial_started_at" IS NULL;
