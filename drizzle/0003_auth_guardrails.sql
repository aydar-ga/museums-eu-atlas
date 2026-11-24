CREATE TABLE IF NOT EXISTS "auth_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"email_hash" text,
	"ip_hash" text,
	"user_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "auth_events" ADD CONSTRAINT "auth_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_events_kind_created_at_idx" ON "auth_events" USING btree ("kind","created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_events_email_hash_created_at_idx" ON "auth_events" USING btree ("email_hash","created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "auth_events_ip_hash_created_at_idx" ON "auth_events" USING btree ("ip_hash","created_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "magic_link_tokens" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "magic_link_tokens_expires_at_idx" ON "magic_link_tokens" USING btree ("expires_at");
