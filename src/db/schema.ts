import { InferSelectModel, relations, sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id")
    .primaryKey()
    .notNull()
    .default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  lastLoginAt: timestamp("last_login_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// Enums
export const orderStatusEnum = pgEnum("order_status", [
  "fulfilled",
  "shipped",
  "awaiting_shipment",
]);
export const phoneModelEnum = pgEnum("phone_model", [
  "iphonex",
  "iphone11",
  "iphone12",
  "iphone13",
  "iphone14",
  "iphone15",
  "iphone16",
]);
export const caseMaterialEnum = pgEnum("case_material", [
  "silicone",
  "polycarbonate",
]);
export const caseFinishEnum = pgEnum("case_finish", ["smooth", "textured"]);
export const caseColorEnum = pgEnum("case_color", ["black", "blue", "rose"]);

// Tables
export const configuration = pgTable("configuration", {
  id: text("id")
    .primaryKey()
    .notNull()
    .default(sql`gen_random_uuid()`),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  imageUrl: text("image_url").notNull(),
  color: caseColorEnum("color"),
  model: phoneModelEnum("model"),
  material: caseMaterialEnum("material"),
  finish: caseFinishEnum("finish"),
  croppedImageUrl: text("cropped_image_url"),
});

export const user = pgTable("user", {
  id: text("id")
    .primaryKey()
    .notNull()
    .default(sql`gen_random_uuid()`),
  email: text("email").unique().notNull(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shippingAddress = pgTable("shipping_address", {
  id: text("id")
    .primaryKey()
    .notNull()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  state: text("state"),
  phoneNumber: text("phone_number"),
});

export const billingAddress = pgTable("billing_address", {
  id: text("id")
    .primaryKey()
    .notNull()
    .default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  street: text("street").notNull(),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  state: text("state"),
  phoneNumber: text("phone_number"),
});

export const order = pgTable("order", {
  id: text("id")
    .primaryKey()
    .notNull()
    .default(sql`gen_random_uuid()`),
  configurationId: text("configuration_id")
    .notNull()
    .references(() => configuration.id),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  amount: real("amount").notNull(),
  isPaid: boolean("is_paid").notNull().default(false),
  status: orderStatusEnum("status").notNull().default("awaiting_shipment"),
  shippingAddressId: text("shipping_address_id").references(
    () => shippingAddress.id,
  ),
  billingAddressId: text("billing_address_id").references(
    () => billingAddress.id,
  ),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updated: timestamp("updated").defaultNow().notNull(),
});

export const emailVerification = pgTable("email_verifiaction", {
  // code: text("code", { length: 6 }).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  used: boolean("used").default(false),
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userEmail: text("user_email")
    .notNull()
    .references(() => usersTable.email, { onDelete: "cascade" })
    .unique(),
  codeHash: text("code_hash").notNull(), // Hashed version for security
  attempts: integer("attempts").default(0).notNull(),
  maxAttempts: integer("max_attempts").default(3).notNull(),
});

// Relations
export const configurationRelations = relations(configuration, ({ many }) => ({
  orders: many(order),
}));

export const userRelations = relations(user, ({ many }) => ({
  orders: many(order),
}));

export const shippingAddressRelations = relations(
  shippingAddress,
  ({ many }) => ({
    orders: many(order),
  }),
);

export const billingAddressRelations = relations(
  billingAddress,
  ({ many }) => ({
    orders: many(order),
  }),
);

export const orderRelations = relations(order, ({ one }) => ({
  configuration: one(configuration, {
    fields: [order.configurationId],
    references: [configuration.id],
  }),
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
  shippingAddress: one(shippingAddress, {
    fields: [order.shippingAddressId],
    references: [shippingAddress.id],
  }),
  billingAddress: one(billingAddress, {
    fields: [order.billingAddressId],
    references: [billingAddress.id],
  }),
}));

export type Order = InferSelectModel<typeof order>;
export type User = InferSelectModel<typeof usersTable>;
export type Configuration = InferSelectModel<typeof configuration>;
export type ShippingAddress = InferSelectModel<typeof shippingAddress>;
export type BillingAddress = InferSelectModel<typeof billingAddress>;
export type EmailVerification = InferSelectModel<typeof emailVerification>;
export type OrderWithRelations = Order & {
  configuration: Configuration;
  user: User;
} & { shippingAddress: ShippingAddress | null } & {
  billingAddress: BillingAddress | null;
};
export type UserWithRelations = User & { orders: Order[] };
export type ConfigurationWithRelations = Configuration & { orders: Order[] };
