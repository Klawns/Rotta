CREATE TABLE `balance_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`user_id` text NOT NULL,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`origin` text NOT NULL,
	`description` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `balance_transactions_user_id_idx` ON `balance_transactions` (`user_id`);--> statement-breakpoint
CREATE INDEX `balance_transactions_client_id_idx` ON `balance_transactions` (`client_id`);--> statement-breakpoint
DROP TABLE `refresh_tokens`;--> statement-breakpoint
ALTER TABLE `clients` ADD `display_id` integer;--> statement-breakpoint
ALTER TABLE `clients` ADD `balance` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `rides` ADD `display_id` integer;--> statement-breakpoint
ALTER TABLE `rides` ADD `paid_with_balance` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `rides` ADD `debt_value` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `display_id` integer;