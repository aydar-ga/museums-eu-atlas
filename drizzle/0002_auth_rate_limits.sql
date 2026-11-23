CREATE TABLE IF NOT EXISTS "auth_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"window_start" timestamp with time zone NOT NULL,
	"count" integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_rate_limits_window_start_idx" ON "auth_rate_limits" USING btree ("window_start");
