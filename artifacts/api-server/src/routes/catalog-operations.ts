import { Router, type IRouter } from "express";
import { count, desc, eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  catalogCategoriesTable,
  catalogProductsTable,
  operationEventsTable,
} from "@workspace/db";
import {
  CreateCatalogCategoryBody,
  CreateCatalogCategoryResponse,
  CreateCatalogProductBody,
  CreateCatalogProductResponse,
  EvaluateCatalogCodeBody,
  EvaluateCatalogCodeResponse,
  GetCatalogDashboardResponse,
  ImportCatalogProductsBody,
  ImportCatalogProductsResponse,
  VerifyCatalogCodeBody,
  VerifyCatalogCodeResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

type OperationStatus = "Aprobado" | "Rechazado";

type EventInput = {
  action: string;
  productId?: number | null;
  status: OperationStatus;
  responseCode: string;
  responseMessage: string;
  responseTimeMs: number;
  sourceFileName?: string | null;
  details?: Record<string, unknown>;
};

const normalizeCode = (value: string) => value.trim().toUpperCase();
const normalizeName = (value: string) => value.trim().replace(/\s+/g, " ");
const codePattern = /^[A-Z0-9][A-Z0-9_-]{1,31}$/;
const categoryNamePattern = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]{1,79}$/u;
const productNamePattern = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]{1,119}$/u;

function elapsed(start: number): number {
  return Math.max(1, Math.round(performance.now() - start));
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "23505"
  );
}

async function recordEvent(event: EventInput) {
  const [saved] = await db
    .insert(operationEventsTable)
    .values({
      action: event.action,
      productId: event.productId ?? null,
      status: event.status,
      responseCode: event.responseCode,
      responseMessage: event.responseMessage,
      responseTimeMs: event.responseTimeMs,
      sourceFileName: event.sourceFileName ?? null,
      details: event.details ?? {},
    })
    .returning();

  return saved;
}

function toOperationResult(
  event: typeof operationEventsTable.$inferSelect,
  productCode: string | null = null,
  productName: string | null = null,
) {
  const details = event.details ?? {};
  return {
    id: event.id,
    action: event.action,
    productId: event.productId,
    productCode:
      productCode ??
      (typeof details["productCode"] === "string"
        ? details["productCode"]
        : null),
    productName:
      productName ??
      (typeof details["productName"] === "string"
        ? details["productName"]
        : typeof details["name"] === "string"
          ? details["name"]
          : null),
    status: event.status as OperationStatus,
    responseCode: event.responseCode,
    responseMessage: event.responseMessage,
    responseTimeMs: event.responseTimeMs,
    sourceFileName: event.sourceFileName,
    createdAt: event.createdAt,
  };
}

async function findProductByCode(code: string) {
  const [product] = await db
    .select({
      id: catalogProductsTable.id,
      categoryId: catalogProductsTable.categoryId,
      categoryName: catalogCategoriesTable.name,
      code: catalogProductsTable.code,
      name: catalogProductsTable.name,
      quantity: catalogProductsTable.quantity,
      createdAt: catalogProductsTable.createdAt,
    })
    .from(catalogProductsTable)
    .innerJoin(
      catalogCategoriesTable,
      eq(catalogProductsTable.categoryId, catalogCategoriesTable.id),
    )
    .where(eq(catalogProductsTable.code, code))
    .limit(1);
  return product;
}

router.get("/catalog/dashboard", async (_req, res): Promise<void> => {
  const [categories, products, recent, categoryCounts, productCounts, approved, rejected] =
    await Promise.all([
      db.select().from(catalogCategoriesTable).orderBy(catalogCategoriesTable.name),
      db
        .select({
          id: catalogProductsTable.id,
          categoryId: catalogProductsTable.categoryId,
          categoryName: catalogCategoriesTable.name,
          code: catalogProductsTable.code,
          name: catalogProductsTable.name,
          quantity: catalogProductsTable.quantity,
          createdAt: catalogProductsTable.createdAt,
        })
        .from(catalogProductsTable)
        .innerJoin(
          catalogCategoriesTable,
          eq(catalogProductsTable.categoryId, catalogCategoriesTable.id),
        )
        .orderBy(desc(catalogProductsTable.createdAt)),
      db
        .select({
          event: operationEventsTable,
          productCode: catalogProductsTable.code,
          productName: catalogProductsTable.name,
        })
        .from(operationEventsTable)
        .leftJoin(
          catalogProductsTable,
          eq(operationEventsTable.productId, catalogProductsTable.id),
        )
        .orderBy(desc(operationEventsTable.createdAt))
        .limit(50),
      db.select({ value: count() }).from(catalogCategoriesTable),
      db.select({ value: count() }).from(catalogProductsTable),
      db
        .select({ value: count() })
        .from(operationEventsTable)
        .where(eq(operationEventsTable.status, "Aprobado")),
      db
        .select({ value: count() })
        .from(operationEventsTable)
        .where(eq(operationEventsTable.status, "Rechazado")),
    ]);

  const response = {
    categories,
    products,
    events: recent.map(({ event, productCode, productName }) =>
      toOperationResult(event, productCode, productName),
    ),
    summary: {
      categoryCount: categoryCounts[0]?.value ?? 0,
      productCount: productCounts[0]?.value ?? 0,
      approvedCount: approved[0]?.value ?? 0,
      rejectedCount: rejected[0]?.value ?? 0,
    },
  };
  res.json(GetCatalogDashboardResponse.parse(response));
});

router.post("/catalog/categories", async (req, res): Promise<void> => {
  const startedAt = performance.now();
  const parsed = CreateCatalogCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const code = normalizeCode(parsed.data.code);
  const name = normalizeName(parsed.data.name);
  if (!codePattern.test(code)) {
    res.status(400).json({
      error: "El código de categoría debe ser alfanumérico (se permite guion o guion bajo).",
    });
    return;
  }
  if (!categoryNamePattern.test(name)) {
    res.status(400).json({
      error: "El nombre de categoría debe contener solo letras y espacios.",
    });
    return;
  }

  const existing = await db.select().from(catalogCategoriesTable);
  if (
    existing.some(
      (category) =>
        normalizeCode(category.code) === code ||
        normalizeName(category.name).toLocaleLowerCase() ===
          name.toLocaleLowerCase(),
    )
  ) {
    const message = "Ya existe una categoría con ese código o nombre.";
    await recordEvent({
      action: "REGISTRAR_CATEGORIA",
      status: "Rechazado",
      responseCode: "CAT-409",
      responseMessage: message,
      responseTimeMs: elapsed(startedAt),
      details: { code, name },
    });
    res.status(409).json({ error: message });
    return;
  }

  try {
    const [category] = await db
      .insert(catalogCategoriesTable)
      .values({ code, name })
      .returning();
    await recordEvent({
      action: "REGISTRAR_CATEGORIA",
      status: "Aprobado",
      responseCode: "CAT-201",
      responseMessage: `Categoría "${name}" registrada correctamente.`,
      responseTimeMs: elapsed(startedAt),
      details: { categoryId: category.id, code, name },
    });
    res.status(201).json(CreateCatalogCategoryResponse.parse(category));
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "El código o nombre de categoría ya existe." });
      return;
    }
    throw error;
  }
});

router.post("/catalog/products", async (req, res): Promise<void> => {
  const startedAt = performance.now();
  const parsed = CreateCatalogProductBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const code = normalizeCode(parsed.data.code);
  const name = normalizeName(parsed.data.name);
  const quantity = parsed.data.quantity;
  if (!Number.isSafeInteger(quantity) || quantity < 0) {
    res.status(400).json({ error: "La cantidad debe ser un número entero igual o mayor que cero." });
    return;
  }
  if (!codePattern.test(code)) {
    res.status(400).json({ error: "El código debe ser alfanumérico." });
    return;
  }
  if (!productNamePattern.test(name)) {
    res.status(400).json({ error: "El nombre del producto contiene caracteres no permitidos." });
    return;
  }

  const [category] = await db
    .select()
    .from(catalogCategoriesTable)
    .where(eq(catalogCategoriesTable.id, parsed.data.categoryId))
    .limit(1);
  if (!category) {
    res.status(400).json({ error: "Seleccione una categoría registrada." });
    return;
  }

  const [duplicate] = await db
    .select({ id: catalogProductsTable.id })
    .from(catalogProductsTable)
    .where(eq(catalogProductsTable.code, code))
    .limit(1);
  if (duplicate) {
    const message = `El código ${code} ya pertenece a otro producto.`;
    await recordEvent({
      action: "REGISTRAR_PRODUCTO",
      status: "Rechazado",
      responseCode: "PROD-409",
      responseMessage: message,
      responseTimeMs: elapsed(startedAt),
      details: { productCode: code, productName: name },
    });
    res.status(409).json({ error: message });
    return;
  }

  try {
    const [product] = await db
      .insert(catalogProductsTable)
      .values({
        categoryId: category.id,
        code,
        name,
        quantity,
      })
      .returning();
    await recordEvent({
      action: "REGISTRAR_PRODUCTO",
      productId: product.id,
      status: "Aprobado",
      responseCode: "PROD-201",
      responseMessage: `Producto "${name}" registrado correctamente.`,
      responseTimeMs: elapsed(startedAt),
      details: { productCode: code, productName: name },
    });
    res
      .status(201)
      .json(
        CreateCatalogProductResponse.parse({
          ...product,
          categoryName: category.name,
        }),
      );
  } catch (error) {
    if (isUniqueViolation(error)) {
      res.status(409).json({ error: "El código de producto ya existe." });
      return;
    }
    throw error;
  }
});

router.post("/operations/evaluate", async (req, res): Promise<void> => {
  const startedAt = performance.now();
  const parsed = EvaluateCatalogCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const code = normalizeCode(parsed.data.code);
  const found = await findProductByCode(code);
  const approved = Boolean(found);
  const event = await recordEvent({
    action: "EVALUAR_CODIGO",
    productId: found?.id ?? null,
    status: approved ? "Aprobado" : "Rechazado",
    responseCode: approved ? "EVAL-200" : "EVAL-404",
    responseMessage: approved
      ? `Código válido. Corresponde al producto "${found?.name}".`
      : `El código ${code} no está asociado a un producto registrado.`,
    responseTimeMs: elapsed(startedAt),
    details: { productCode: code, productName: found?.name ?? null },
  });
  res.json(EvaluateCatalogCodeResponse.parse(toOperationResult(event, found?.code ?? null, found?.name ?? null)));
});

router.post("/operations/verify", async (req, res): Promise<void> => {
  const startedAt = performance.now();
  const parsed = VerifyCatalogCodeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const code = normalizeCode(parsed.data.code);
  const found = await findProductByCode(code);
  const approved = Boolean(found);
  const event = await recordEvent({
    action: "VERIFICAR_CODIGO",
    productId: found?.id ?? null,
    status: approved ? "Aprobado" : "Rechazado",
    responseCode: approved ? "VER-200" : "VER-404",
    responseMessage: approved
      ? `Producto verificado: ${found?.name}, cantidad registrada ${found?.quantity}.`
      : `No se encontró un producto registrado con el código ${code}.`,
    responseTimeMs: elapsed(startedAt),
    details: { productCode: code, productName: found?.name ?? null },
  });
  res.json(
    VerifyCatalogCodeResponse.parse({
      result: toOperationResult(event, found?.code ?? null, found?.name ?? null),
      product: found ?? null,
    }),
  );
});

router.post("/operations/import", async (req, res): Promise<void> => {
  const importStartedAt = performance.now();
  const parsed = ImportCatalogProductsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const fileName = parsed.data.fileName.trim().slice(0, 255);
  const rows = parsed.data.rows;
  const categories = await db.select().from(catalogCategoriesTable);
  const results = [];

  for (let index = 0; index < rows.length; index++) {
    const rowStartedAt = performance.now();
    const row = rows[index]!;
    const code = normalizeCode(row.code);
    const name = normalizeName(row.name);
    const categoryValue = normalizeName(row.category);
    let event: typeof operationEventsTable.$inferSelect;
    let product: typeof catalogProductsTable.$inferSelect | undefined;
    let errorMessage: string | undefined;

    // Validate in the requested order: numeric, alphanumeric, alphabetic.
    if (!Number.isSafeInteger(row.quantity) || row.quantity < 0) {
      errorMessage = `Fila ${index + 2}: la cantidad debe ser un entero mayor o igual a cero.`;
    } else if (!codePattern.test(code)) {
      errorMessage = `Fila ${index + 2}: el código debe ser alfanumérico.`;
    } else if (!productNamePattern.test(name)) {
      errorMessage = `Fila ${index + 2}: el nombre contiene caracteres no permitidos.`;
    }

    const category = categories.find(
      (candidate) =>
        normalizeCode(candidate.code) === normalizeCode(categoryValue) ||
        normalizeName(candidate.name).toLocaleLowerCase() ===
          categoryValue.toLocaleLowerCase(),
    );
    if (!errorMessage && !category) {
      errorMessage = `Fila ${index + 2}: la categoría "${categoryValue}" no está registrada.`;
    }

    if (!errorMessage) {
      const [duplicate] = await db
        .select({ id: catalogProductsTable.id })
        .from(catalogProductsTable)
        .where(eq(catalogProductsTable.code, code))
        .limit(1);
      if (duplicate) {
        errorMessage = `Fila ${index + 2}: el código ${code} ya existe.`;
      }
    }

    if (!errorMessage && category) {
      try {
        [product] = await db
          .insert(catalogProductsTable)
          .values({
            categoryId: category.id,
            code,
            name,
            quantity: row.quantity,
          })
          .returning();
      } catch (error) {
        if (isUniqueViolation(error)) {
          errorMessage = `Fila ${index + 2}: el código ${code} ya existe.`;
        } else {
          throw error;
        }
      }
    }

    event = await recordEvent({
      action: "SUBIR_ARCHIVO",
      productId: product?.id ?? null,
      status: errorMessage ? "Rechazado" : "Aprobado",
      responseCode: errorMessage ? "FILE-422" : "FILE-201",
      responseMessage:
        errorMessage ?? `Fila ${index + 2}: producto "${name}" cargado correctamente.`,
      responseTimeMs: elapsed(rowStartedAt),
      sourceFileName: fileName,
      details: { productCode: code || null, productName: name || null, row: index + 2 },
    });
    results.push(toOperationResult(event, product?.code ?? null, product?.name ?? null));
  }

  const approvedRows = results.filter((result) => result.status === "Aprobado").length;
  const response = {
    fileName,
    totalRows: rows.length,
    approvedRows,
    rejectedRows: rows.length - approvedRows,
    responseTimeMs: elapsed(importStartedAt),
    results,
  };
  res.json(ImportCatalogProductsResponse.parse(response));
});

export default router;
