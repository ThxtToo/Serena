import { createInsertSchema } from "drizzle-zod";
import {
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const catalogCategoriesTable = pgTable(
  "catalog_categories",
  {
    id: serial("id").primaryKey(),
    code: text("code").notNull(),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("catalog_categories_code_unique").on(table.code),
    unique("catalog_categories_name_unique").on(table.name),
  ],
);

export const catalogProductsTable = pgTable(
  "catalog_products",
  {
    id: serial("id").primaryKey(),
    categoryId: integer("category_id")
      .notNull()
      .references(() => catalogCategoriesTable.id, { onDelete: "restrict" }),
    code: text("code").notNull(),
    name: text("name").notNull(),
    quantity: integer("quantity").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [unique("catalog_products_code_unique").on(table.code)],
);

export const insertCatalogCategorySchema = createInsertSchema(
  catalogCategoriesTable,
).omit({ id: true, createdAt: true });

export const insertCatalogProductSchema = createInsertSchema(
  catalogProductsTable,
).omit({ id: true, createdAt: true });

export type InsertCatalogCategory = z.infer<
  typeof insertCatalogCategorySchema
>;
export type CatalogCategory = typeof catalogCategoriesTable.$inferSelect;
export type InsertCatalogProduct = z.infer<typeof insertCatalogProductSchema>;
export type CatalogProduct = typeof catalogProductsTable.$inferSelect;
