CREATE TYPE "public"."case_color" AS ENUM('black', 'blue', 'rose');--> statement-breakpoint
CREATE TYPE "public"."case_finish" AS ENUM('smooth', 'textured');--> statement-breakpoint
CREATE TYPE "public"."case_material" AS ENUM('silicone', 'polycarbonate');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('fulfilled', 'shipped', 'awaiting_shipment');--> statement-breakpoint
CREATE TYPE "public"."phone_model" AS ENUM('iphonex', 'iphone11', 'iphone12', 'iphone13', 'iphone14', 'iphone15', 'iphone16');--> statement-breakpoint
CREATE TABLE "billing_address" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"street" text NOT NULL,
	"city" text NOT NULL,
	"postal_code" text NOT NULL,
	"country" text NOT NULL,
	"state" text,
	"phone_number" text
);
--> statement-breakpoint
CREATE TABLE "configuration" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"width" integer NOT NULL,
	"height" integer NOT NULL,
	"image_url" text NOT NULL,
	"color" "case_color",
	"model" "phone_model",
	"material" "case_material",
	"finish" "case_finish",
	"cropped_image_url" text
);
--> statement-breakpoint
CREATE TABLE "email_verifiaction" (
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"used" boolean DEFAULT false,
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "email_verifiaction_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_email" text NOT NULL,
	"code_hash" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"max_attempts" integer DEFAULT 3 NOT NULL,
	CONSTRAINT "email_verifiaction_user_email_unique" UNIQUE("user_email")
);
--> statement-breakpoint
CREATE TABLE "order" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"configuration_id" text NOT NULL,
	"user_id" text NOT NULL,
	"amount" real NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"status" "order_status" DEFAULT 'awaiting_shipment' NOT NULL,
	"shipping_address_id" text,
	"billing_address_id" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shipping_address" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"street" text NOT NULL,
	"city" text NOT NULL,
	"postal_code" text NOT NULL,
	"country" text NOT NULL,
	"state" text,
	"phone_number" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"email_verified" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "email_verifiaction" ADD CONSTRAINT "email_verifiaction_user_email_users_email_fk" FOREIGN KEY ("user_email") REFERENCES "public"."users"("email") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_configuration_id_configuration_id_fk" FOREIGN KEY ("configuration_id") REFERENCES "public"."configuration"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_shipping_address_id_shipping_address_id_fk" FOREIGN KEY ("shipping_address_id") REFERENCES "public"."shipping_address"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order" ADD CONSTRAINT "order_billing_address_id_billing_address_id_fk" FOREIGN KEY ("billing_address_id") REFERENCES "public"."billing_address"("id") ON DELETE no action ON UPDATE no action;