CREATE TABLE IF NOT EXISTS "feedback_messages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"kind" text NOT NULL,
	"message" text NOT NULL,
	"reply_email" text,
	"ip_hash" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feedback_messages_created_at_idx" ON "feedback_messages" USING btree ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "feedback_messages_ip_hash_created_at_idx" ON "feedback_messages" USING btree ("ip_hash","created_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "product_event_counts" (
	"day" date NOT NULL,
	"name" text NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "product_event_counts_day_name_subject_pk" PRIMARY KEY("day","name","subject")
);
