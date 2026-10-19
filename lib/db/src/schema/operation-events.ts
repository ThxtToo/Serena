import { createInsertSchema } from "drizzle-zod";
import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { catalogProductsTable } from "./catalog";

export const operationEventsTable = pgTable(
  "operation_events",
  {
    id: serial("id").primaryKey(),
    action: text("action").notNull(),
    productId: integer("product_id").references(() => catalogProductsTable.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull(),
    responseCode: text("response_code").notNull(),
    responseMessage: text("response_message").notNull(),
    responseTimeMs: integer("response_time_ms").notNull(),
    sourceFileName: text("source_file_name"),
    details: jsonb("details").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("operation_events_created_at_idx").on(table.createdAt),
    index("operation_events_status_idx").on(table.status),
  ],
);

export const insertOperationEventSchema = createInsertSchema(
  operationEventsTable,
).omit({ id: true, createdAt: true });

export type InsertOperationEvent = z.infer<
  typeof insertOperationEventSchema
>;
export type OperationEvent = typeof operationEventsTable.$inferSelect;
