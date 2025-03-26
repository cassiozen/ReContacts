CREATE TABLE "notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" varchar(50) NOT NULL,
	"dismissed" boolean DEFAULT false NOT NULL,
	"content" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
