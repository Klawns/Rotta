ALTER TABLE "backup_jobs" ALTER COLUMN "kind" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "backup_jobs" ALTER COLUMN "kind" SET DEFAULT 'functional_user'::text;--> statement-breakpoint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "backup_jobs"
    WHERE "kind" = 'pre_import'
  ) THEN
    RAISE EXCEPTION 'backup_job_kind cleanup requires backfill first: backup_jobs.kind still contains pre_import';
  END IF;
END
$$;--> statement-breakpoint
DROP TYPE "public"."backup_job_kind";--> statement-breakpoint
CREATE TYPE "public"."backup_job_kind" AS ENUM('functional_user', 'technical_full');--> statement-breakpoint
ALTER TABLE "backup_jobs" ALTER COLUMN "kind" SET DEFAULT 'functional_user'::"public"."backup_job_kind";--> statement-breakpoint
ALTER TABLE "backup_jobs" ALTER COLUMN "kind" SET DATA TYPE "public"."backup_job_kind" USING "kind"::"public"."backup_job_kind";
