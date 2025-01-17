CREATE TABLE "auto-elink_account" (
	"user_id" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"provider_account_id" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "auto-elink_account_provider_provider_account_id_pk" PRIMARY KEY("provider","provider_account_id")
);
--> statement-breakpoint
CREATE TABLE "auto-elink_keyword" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"content" varchar(256) NOT NULL,
	"description" text,
	"user_id" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auto-elink_session" (
	"session_token" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "auto-elink_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"password" varchar(255),
	"email_verified" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255),
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "auto-elink_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "auto-elink_verification_token" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp with time zone NOT NULL,
	CONSTRAINT "auto-elink_verification_token_identifier_token_pk" PRIMARY KEY("identifier","token")
);
--> statement-breakpoint
ALTER TABLE "auto-elink_account" ADD CONSTRAINT "auto-elink_account_user_id_auto-elink_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auto-elink_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto-elink_keyword" ADD CONSTRAINT "auto-elink_keyword_user_id_auto-elink_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auto-elink_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auto-elink_session" ADD CONSTRAINT "auto-elink_session_user_id_auto-elink_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."auto-elink_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_idx" ON "auto-elink_account" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "keyword_user_id_idx" ON "auto-elink_keyword" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "keyword_content_idx" ON "auto-elink_keyword" USING btree ("content");--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "auto-elink_session" USING btree ("user_id");