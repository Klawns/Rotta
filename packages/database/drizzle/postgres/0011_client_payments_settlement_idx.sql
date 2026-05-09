CREATE INDEX "client_payments_settlement_idx" ON "client_payments" USING btree ("user_id","client_id","status","payment_date","created_at","id");
