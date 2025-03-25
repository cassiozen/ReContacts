CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "contacts_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "first_name_idx" ON "contacts" USING btree ("first_name");
--> statement-breakpoint
CREATE INDEX "last_name_idx" ON "contacts" USING btree ("last_name");