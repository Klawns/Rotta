ALTER TABLE `subscriptions` ADD `trial_started_at` integer;--> statement-breakpoint
UPDATE `subscriptions`
SET `trial_started_at` = (
  SELECT `users`.`created_at`
  FROM `users`
  WHERE `users`.`id` = `subscriptions`.`user_id`
)
WHERE `plan` = 'starter' AND `trial_started_at` IS NULL;
