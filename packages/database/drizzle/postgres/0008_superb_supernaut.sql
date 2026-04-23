ALTER TYPE "public"."payment_used_status" ADD VALUE 'PARTIALLY_USED' BEFORE 'USED';--> statement-breakpoint
ALTER TABLE "client_payments" ADD COLUMN "remaining_amount" numeric(10, 2) DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "client_payments" ADD COLUMN "idempotency_key" text;--> statement-breakpoint
ALTER TABLE "rides" ADD COLUMN "paid_externally" numeric(10, 2) DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "client_payments_user_idempotency_key_idx" ON "client_payments" USING btree ("user_id","idempotency_key");