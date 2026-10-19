import { useMemo, useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  getGetCatalogDashboardQueryKey,
  useCreateCatalogCategory,
  useCreateCatalogProduct,
  useEvaluateCatalogCode,
  useGetCatalogDashboard,
  useImportCatalogProducts,
  useVerifyCatalogCode,
} from '@workspace/api-client-react';
import type { CatalogImportRow, OperationResult } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Activity, ArrowRight, BadgeCheck, Boxes, Check, CircleAlert,
  Clock3, Database, FileSpreadsheet, LoaderCircle, PackagePlus,
  RotateCw, SearchCheck, ShieldCheck, Upload, X,
} from 'lucide-react';

type ImportView = {
  fileName: string;
  totalRows: number;
  approvedRows: number;
  rejectedRows: number;
  responseTimeMs: number;
  results: Array<OperationResult & { rowNumber: number }>;
};

const alphaRegex = /^[\p{L}\p{M}][\p{L}\p{M}\s.'-]*$/u;
const alphaNumericRegex = /^[A-Za-z0-9_-]+$/;

function readApiError(error: unknown) {
  if (
    error &&
    typeof error === 'object' &&
    'data' in error &&
    error.data &&
    typeof error.data === 'object' &&
    'error' in error.data &&
    typeof error.data.error === 'string'
  ) {
    return error.data.error;
  }
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  return 'No fue posible completar la operación. Intente nuevamente.';
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') {
      cell += '"';
      i += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(cell.trim());
      cell = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell.trim());
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += char;
    }
  }
  row.push(cell.trim());
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}

function responseTime(value: number | undefined) {
  return `${value ?? 0} ms`;
}

function Outcome({ status }: { status: string }) {
  const approved = status === 'Aprobado';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${approved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
      {approved ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
      {status}
    </span>
  );
}

function ResultCard({ result, label }: { result: OperationResult | null; label: string }) {
  if (!result) return null;
  return (
    <div className={`mt-4 rounded-lg border p-4 ${result.status === 'Aprobado' ? 'border-emerald-200 bg-emerald-50/70' : 'border-rose-200 bg-rose-50/70'}`} data-testid="result-latest">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {result.status === 'Aprobado' ? <BadgeCheck className="h-4 w-4 text-emerald-700" /> : <CircleAlert className="h-4 w-4 text-rose-700" />}
          <span className="text-sm font-semibold text-foreground">{label}</span>
          <Outcome status={result.status} />
        </div>
        <span className="font-mono text-xs text-muted-foreground">{responseTime(result.responseTimeMs)}</span>
      </div>
      <p className="mt-2 text-sm text-foreground">{result.responseMessage}</p>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span>Código de respuesta: <strong className="font-mono text-foreground">{result.responseCode}</strong></span>
        {result.productCode && <span>Producto: <strong className="font-mono text-foreground">{result.productCode}</strong></span>}
      </div>
    </div>
  );
}

export default function RegistroEvaluacion() {
  const queryClient = useQueryClient();
  const dashboardQuery = useGetCatalogDashboard();
  const createCategory = useCreateCatalogCategory();
  const createProduct = useCreateCatalogProduct();
  const evaluateCode = useEvaluateCatalogCode();
  const verifyCode = useVerifyCatalogCode();
  const importProducts = useImportCatalogProducts();

  const [categoryCode, setCategoryCode] = useState('');
  const [categoryName, setCategoryName] = useState('');
  const [productCategory, setProductCategory] = useState('');
  const [productCode, setProductCode] = useState('');
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [evaluationCode, setEvaluationCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [validationNotice, setValidationNotice] = useState('');
  const [formError, setFormError] = useState('');
  const [latestEvaluation, setLatestEvaluation] = useState<OperationResult | null>(null);
  const [latestVerification, setLatestVerification] = useState<OperationResult | null>(null);
  const [verifiedProduct, setVerifiedProduct] = useState<{ code: string; name: string; categoryName: string; quantity: number } | null>(null);
  const [importView, setImportView] = useState<ImportView | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const data = dashboardQuery.data;
  const categories = data?.categories ?? [];
  const products = data?.products ?? [];
  const events = data?.events ?? [];
  const refreshDashboard = () => queryClient.invalidateQueries({ queryKey: getGetCatalogDashboardQueryKey() });
  const clearError = () => setFormError('');
  const categoryCodeValid = categoryCode.trim().length >= 2 && categoryCode.trim().length <= 24 && alphaNumericRegex.test(categoryCode.trim());
  const categoryNameValid = categoryName.trim().length >= 2 && categoryName.trim().length <= 80 && alphaRegex.test(categoryName.trim());
  const productCodeValid = productCode.trim().length >= 2 && productCode.trim().length <= 32 && alphaNumericRegex.test(productCode.trim());
  const productNameValid = productName.trim().length >= 2 && productName.trim().length <= 120 && alphaRegex.test(productName.trim());
  const quantityValid = quantity !== '' && Number.isInteger(Number(quantity)) && Number(quantity) >= 0;
  const latestEvent = events[0];

  const validationStatus = useMemo(() => [
    { name: 'Numérico', detail: 'Cantidad entera, cero o mayor', done: quantityValid },
    { name: 'Alfanumérico', detail: 'Código sin espacios ni símbolos', done: productCodeValid && categoryCodeValid },
    { name: 'Alfabético', detail: 'Nombre con letras y espacios', done: productNameValid && categoryNameValid },
  ], [quantityValid, productCodeValid, categoryCodeValid, productNameValid, categoryNameValid]);

  const submitCategory = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    if (!categoryCodeValid || !categoryNameValid) {
      setValidationNotice('Revise el código alfanumérico y el nombre alfabético de la categoría.');
      return;
    }
    createCategory.mutate({ data: { code: categoryCode.trim(), name: categoryName.trim() } }, {
      onSuccess: () => {
        setCategoryCode('');
        setCategoryName('');
        setValidationNotice('Categoría registrada y guardada en el catálogo.');
        refreshDashboard();
      },
      onError: (error) => setFormError(readApiError(error)),
    });
  };

  const submitProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    if (!productCategory || !productCodeValid || !productNameValid || !quantityValid) {
      setValidationNotice('Complete los campos respetando la secuencia numérico → alfanumérico → alfabético.');
      return;
    }
    createProduct.mutate({ data: { categoryId: Number(productCategory), code: productCode.trim(), name: productName.trim(), quantity: Number(quantity) } }, {
      onSuccess: () => {
        setProductCode('');
        setProductName('');
        setQuantity('');
        setValidationNotice('Producto registrado y vinculado a su categoría.');
        refreshDashboard();
      },
      onError: (error) => setFormError(readApiError(error)),
    });
  };

  const submitEvaluation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    if (evaluationCode.trim().length < 2 || evaluationCode.trim().length > 32 || !alphaNumericRegex.test(evaluationCode.trim())) {
      setValidationNotice('El código debe contener entre 2 y 32 caracteres alfanuméricos, sin espacios.');
      return;
    }
    evaluateCode.mutate({ data: { code: evaluationCode.trim() } }, {
      onSuccess: (result) => {
        setLatestEvaluation(result);
        setEvaluationCode('');
        refreshDashboard();
      },
      onError: (error) => setFormError(readApiError(error)),
    });
  };

  const submitVerification = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    if (verificationCode.trim().length < 2 || verificationCode.trim().length > 32 || !alphaNumericRegex.test(verificationCode.trim())) {
      setValidationNotice('El código debe contener entre 2 y 32 caracteres alfanuméricos, sin espacios.');
      return;
    }
    verifyCode.mutate({ data: { code: verificationCode.trim() } }, {
      onSuccess: (result) => {
        setLatestVerification(result.result);
        setVerifiedProduct(result.product ? {
          code: result.product.code,
          name: result.product.name,
          categoryName: result.product.categoryName,
          quantity: result.product.quantity,
        } : null);
        setVerificationCode('');
        refreshDashboard();
      },
      onError: (error) => setFormError(readApiError(error)),
    });
  };

  const handleFileSelect = (file?: File) => {
    clearError();
    setImportView(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setSelectedFile(null);
      setFormError('Seleccione un archivo con extensión .csv.');
      return;
    }
    setSelectedFile(file);
  };

  const submitImport = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearError();
    if (!selectedFile) {
      setFormError('Seleccione un archivo CSV antes de cargarlo.');
      return;
    }
    try {
      const parsed = parseCsv(await selectedFile.text());
      const expectedHeader = ['codigo', 'nombre', 'categoria', 'cantidad'];
      const header = (parsed[0] ?? []).map((item) => item.replace(/^\uFEFF/, ''));
      if (header.length !== expectedHeader.length || expectedHeader.some((item, index) => header[index] !== item)) {
        setFormError('Encabezado inválido. Se requiere exactamente: codigo,nombre,categoria,cantidad');
        return;
      }
      const csvRows = parsed.slice(1);
      if (csvRows.length === 0) {
        setFormError('El CSV no contiene filas de datos.');
        return;
      }
      if (csvRows.length > 500) {
        setFormError(`El archivo contiene ${csvRows.length} filas. El máximo permitido por carga es 500.`);
        return;
      }
      const apiRows: CatalogImportRow[] = csvRows.map((row) => {
        const [code = '', name = '', category = '', quantityText = '', ...extra] = row;
        const parsedQuantity = Number(quantityText);
        return {
          // Invalid column counts are sent with an invalid code so the server
          // records a rejected event instead of silently dropping the row.
          code: row.length === 4 && extra.length === 0 ? code : '',
          name,
          category,
          quantity: quantityText.trim() !== '' && Number.isInteger(parsedQuantity) && parsedQuantity >= 0 ? parsedQuantity : -1,
        };
      });
      const apiRowNumbers = csvRows.map((_, index) => index + 2);
      importProducts.mutate({ data: { fileName: selectedFile.name, rows: apiRows } }, {
        onSuccess: (result) => {
          const rowsWithNumbers = result.results.map((item, index) => ({ ...item, rowNumber: apiRowNumbers[index] ?? index + 2 }));
          setImportView({
            fileName: result.fileName,
            totalRows: csvRows.length,
            approvedRows: result.approvedRows,
            rejectedRows: result.rejectedRows,
            responseTimeMs: result.responseTimeMs,
            results: rowsWithNumbers,
          });
          setSelectedFile(null);
          if (fileInput.current) fileInput.current.value = '';
          refreshDashboard();
        },
        onError: (error) => setFormError(readApiError(error)),
      });
    } catch {
      setFormError('No se pudo leer el archivo. Compruebe que sea un CSV de texto válido.');
    }
  };

  return (
    <div className="space-y-7 pb-10" data-testid="page-registro-evaluacion">
      <section className="relative overflow-hidden rounded-xl bg-[#243c46] px-6 py-7 text-[#f4f0e6] shadow-md sm:px-8">
        <div className="absolute -right-14 -top-20 h-64 w-64 rounded-full border border-white/10" />
        <div className="absolute -right-2 -top-8 h-44 w-44 rounded-full border border-white/10" />
        <div className="relative max-w-3xl">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#d9c89d]">
            <ShieldCheck className="h-4 w-4" /> Módulo de demostración académica
          </div>
          <h1 className="text-3xl font-serif font-medium tracking-tight text-[#f4f0e6] sm:text-4xl">Registro y evaluación</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/75">
            Catálogo de prueba para mostrar altas, validaciones y resultados persistidos. Este módulo es exclusivo del panel de personal; no representa una validación operativa real.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="rounded border border-white/20 px-3 py-1.5 text-xs text-white/85">Rol personal: registra y valida</span>
            <span className="rounded border border-white/20 px-3 py-1.5 text-xs text-white/85">Usuario: consulta la experiencia pública</span>
          </div>
        </div>
      </section>

      {formError && <div role="alert" className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800" data-testid="status-form-error"><CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />{formError}</div>}
      {validationNotice && <div role="status" className="flex items-start gap-2 rounded-lg border border-[#d9c89d] bg-[#f8f3e7] p-3 text-sm text-[#66582e]" data-testid="status-validation"><Activity className="mt-0.5 h-4 w-4 shrink-0" />{validationNotice}</div>}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Resumen del catálogo">
        {[
          { label: 'Categorías', value: data?.summary.categoryCount ?? 0, icon: Boxes, tint: 'bg-[#e9eef0] text-[#3e5a64]' },
          { label: 'Productos', value: data?.summary.productCount ?? 0, icon: PackagePlus, tint: 'bg-[#f1ead9] text-[#8a7440]' },
          { label: 'Aprobados', value: data?.summary.approvedCount ?? 0, icon: Check, tint: 'bg-emerald-100 text-emerald-800' },
          { label: 'Rechazados', value: data?.summary.rejectedCount ?? 0, icon: X, tint: 'bg-rose-100 text-rose-800' },
        ].map(({ label, value, icon: Icon, tint }) => (
          <Card key={label} className="border-card-border shadow-sm">
            <CardContent className="flex items-center gap-3 p-4 sm:p-5">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tint}`}><Icon className="h-5 w-5" /></span>
              <div><p className="text-xs font-medium text-muted-foreground">{label}</p><p className="mt-0.5 font-mono text-2xl font-semibold tracking-tight" data-testid={`count-${label.toLowerCase()}`}>{dashboardQuery.isLoading ? '—' : value}</p></div>
            </CardContent>
          </Card>
        ))}
      </section>

      {dashboardQuery.isLoading && <div className="space-y-3" aria-label="Cargando catálogo"><div className="h-20 animate-pulse rounded-lg bg-muted" /><div className="h-48 animate-pulse rounded-lg bg-muted" /></div>}
      {dashboardQuery.isError && (
        <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800 sm:flex-row sm:items-center sm:justify-between" data-testid="status-dashboard-error">
          <span>No se pudo cargar el catálogo del servidor. Los datos no se han sustituido por valores locales.</span>
          <Button variant="outline" size="sm" onClick={() => dashboardQuery.refetch()} data-testid="button-retry-dashboard"><RotateCw className="mr-2 h-4 w-4" />Reintentar</Button>
        </div>
      )}

      <Card className="border-card-border">
        <CardHeader className="pb-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e9eef0] text-[#3e5a64]"><Database className="h-5 w-5" /></span>
            <div><CardTitle className="font-serif text-xl">Criterios del proyecto</CardTitle><CardDescription>Requisitos, relaciones y flujo de entrada a salida</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-[1.05fr_1fr_1.2fr]">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Requisitos funcionales</h3>
            <ul className="mt-2 space-y-2 text-sm leading-5 text-muted-foreground">
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6c816c]" />Registrar categorías y productos relacionados.</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6c816c]" />Evaluar y verificar códigos con historial de resultados.</li>
              <li className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[#6c816c]" />Importar CSV y obtener resultado por fila.</li>
            </ul>
            <h3 className="mt-5 text-sm font-semibold text-foreground">No funcionales</h3>
            <p className="mt-2 text-sm leading-5 text-muted-foreground">Persistencia en servidor, validación antes de enviar, trazabilidad de respuesta y diseño adaptable. Acceso a este flujo desde el panel de personal.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Relaciones de datos</h3>
            <div className="mt-3 space-y-2">
              <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs sm:text-sm"><span className="font-semibold">Categorías</span><span className="font-mono text-muted-foreground">1</span><ArrowRight className="h-4 w-4 text-[#8a7440]" /><span className="font-mono text-muted-foreground">N</span><span className="font-semibold">Productos</span></div>
              <div className="flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs sm:text-sm"><span className="font-semibold">Productos</span><span className="font-mono text-muted-foreground">1</span><ArrowRight className="h-4 w-4 text-[#8a7440]" /><span className="font-mono text-muted-foreground">N</span><span className="font-semibold">Resultados de proceso</span></div>
            </div>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">Un resultado rechazado puede no estar asociado a un producto.</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Entrada → proceso → salida</h3>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-md bg-[#f1ead9] px-3 py-2 font-medium text-[#66582e]">Formulario / CSV</span><ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="rounded-md bg-[#e9eef0] px-3 py-2 font-medium text-[#3e5a64]">Validar y consultar</span><ArrowRight className="h-4 w-4 text-muted-foreground" />
              <span className="rounded-md bg-emerald-100 px-3 py-2 font-medium text-emerald-800">Aprobado / Rechazado</span>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {validationStatus.map((step, index) => (
                <div key={step.name} className={`rounded-md border p-2 ${step.done ? 'border-emerald-200 bg-emerald-50' : 'bg-background'}`} data-testid={`validation-step-${index + 1}`}>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{index + 1}. {step.name}</p>
                  <p className="mt-1 text-[11px] leading-4 text-muted-foreground">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="border-card-border">
          <CardHeader><CardTitle className="font-serif text-xl">Registrar categoría</CardTitle><CardDescription>Define una categoría para organizar productos del catálogo.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={submitCategory} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="category-code">Código</Label><Input id="category-code" value={categoryCode} onChange={(e) => { setCategoryCode(e.target.value); clearError(); }} placeholder="URNAS" maxLength={24} aria-invalid={categoryCode !== '' && !categoryCodeValid} data-testid="input-category-code" /><p className="text-xs text-muted-foreground">2–24 caracteres alfanuméricos</p></div>
                <div className="space-y-2"><Label htmlFor="category-name">Nombre</Label><Input id="category-name" value={categoryName} onChange={(e) => { setCategoryName(e.target.value); clearError(); }} placeholder="Urnas funerarias" maxLength={80} aria-invalid={categoryName !== '' && !categoryNameValid} data-testid="input-category-name" /><p className="text-xs text-muted-foreground">2–80 caracteres alfabéticos</p></div>
              </div>
              <Button type="submit" disabled={createCategory.isPending} data-testid="button-create-category">{createCategory.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}Registrar categoría</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader><CardTitle className="font-serif text-xl">Registrar producto</CardTitle><CardDescription>Vincula una entrada a una categoría persistida.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={submitProduct} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-category">Categoría</Label>
                <select id="product-category" value={productCategory} onChange={(e) => { setProductCategory(e.target.value); clearError(); }} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid="select-product-category">
                  <option value="">Seleccione una categoría</option>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.name} · {category.code}</option>)}
                </select>
                {categories.length === 0 && !dashboardQuery.isLoading && <p className="text-xs text-muted-foreground">Registre una categoría antes de crear productos.</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label htmlFor="product-code">Código</Label><Input id="product-code" value={productCode} onChange={(e) => { setProductCode(e.target.value); clearError(); }} placeholder="UR204" maxLength={32} aria-invalid={productCode !== '' && !productCodeValid} data-testid="input-product-code" /></div>
                <div className="space-y-2"><Label htmlFor="product-name">Nombre</Label><Input id="product-name" value={productName} onChange={(e) => { setProductName(e.target.value); clearError(); }} placeholder="Urna nogal" maxLength={120} aria-invalid={productName !== '' && !productNameValid} data-testid="input-product-name" /></div>
              </div>
              <div className="space-y-2"><Label htmlFor="product-quantity">Cantidad</Label><Input id="product-quantity" type="number" min="0" step="1" value={quantity} onChange={(e) => { setQuantity(e.target.value); clearError(); }} placeholder="0" aria-invalid={quantity !== '' && !quantityValid} data-testid="input-product-quantity" /></div>
              <Button type="submit" disabled={createProduct.isPending || categories.length === 0} data-testid="button-create-product">{createProduct.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <PackagePlus className="mr-2 h-4 w-4" />}Registrar producto</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Card className="border-card-border">
          <CardHeader><CardTitle className="font-serif text-xl">Evaluar código</CardTitle><CardDescription>Resultado aprobado si existe en el catálogo; rechazado si no está registrado.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={submitEvaluation} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2"><Label htmlFor="evaluation-code">Código de producto</Label><Input id="evaluation-code" value={evaluationCode} onChange={(e) => { setEvaluationCode(e.target.value); clearError(); }} placeholder="UR204" maxLength={32} data-testid="input-evaluate-code" /></div>
              <Button type="submit" disabled={evaluateCode.isPending} data-testid="button-evaluate-code">{evaluateCode.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}Evaluar</Button>
            </form>
            <ResultCard result={latestEvaluation} label="Salida de evaluación" />
          </CardContent>
        </Card>
        <Card className="border-card-border">
          <CardHeader><CardTitle className="font-serif text-xl">Verificar código</CardTitle><CardDescription>Consulta detalles del producto encontrado y registra el resultado.</CardDescription></CardHeader>
          <CardContent>
            <form onSubmit={submitVerification} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-2"><Label htmlFor="verification-code">Código de producto</Label><Input id="verification-code" value={verificationCode} onChange={(e) => { setVerificationCode(e.target.value); clearError(); }} placeholder="UR204" maxLength={32} data-testid="input-verify-code" /></div>
              <Button type="submit" variant="secondary" disabled={verifyCode.isPending} data-testid="button-verify-code">{verifyCode.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <SearchCheck className="mr-2 h-4 w-4" />}Verificar</Button>
            </form>
            <ResultCard result={latestVerification} label="Salida de verificación" />
            {verifiedProduct && (
              <div className="mt-3 grid grid-cols-2 gap-3 rounded-lg border bg-muted/30 p-4 text-sm sm:grid-cols-4" data-testid="verified-product-details">
                <div><p className="text-xs text-muted-foreground">Código</p><p className="mt-1 font-mono font-semibold">{verifiedProduct.code}</p></div>
                <div><p className="text-xs text-muted-foreground">Producto</p><p className="mt-1 font-medium">{verifiedProduct.name}</p></div>
                <div><p className="text-xs text-muted-foreground">Categoría</p><p className="mt-1">{verifiedProduct.categoryName}</p></div>
                <div><p className="text-xs text-muted-foreground">Cantidad</p><p className="mt-1 font-mono">{verifiedProduct.quantity}</p></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-card-border">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div><CardTitle className="font-serif text-xl">Importar productos CSV</CardTitle><CardDescription className="mt-1">Hasta 500 filas. Encabezado requerido, en este orden: codigo,nombre,categoria,cantidad.</CardDescription></div>
            <span className="inline-flex w-fit items-center gap-2 rounded-md bg-[#f1ead9] px-3 py-2 text-xs font-medium text-[#66582e]"><FileSpreadsheet className="h-4 w-4" />Categoría por código o nombre</span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitImport} className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1 space-y-2">
              <Label htmlFor="catalog-csv">Archivo CSV</Label>
              <Input ref={fileInput} id="catalog-csv" type="file" accept=".csv,text/csv" onChange={(e) => handleFileSelect(e.target.files?.[0])} className="file:mr-3 file:rounded file:border-0 file:bg-[#e9eef0] file:px-3 file:py-1 file:text-xs file:font-medium file:text-[#3e5a64]" data-testid="input-csv-file" />
              <p className="text-xs text-muted-foreground">{selectedFile ? `${selectedFile.name} · ${Math.max(1, Math.ceil(selectedFile.size / 1024))} KB` : 'CSV de texto · máximo 500 filas de datos'}</p>
            </div>
            <Button type="submit" disabled={!selectedFile || importProducts.isPending} data-testid="button-import-csv">{importProducts.isPending ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}Cargar CSV</Button>
          </form>
          {importView && (
            <div className="mt-5 space-y-4" data-testid="csv-import-summary">
              <div className="grid grid-cols-2 gap-3 rounded-lg bg-[#f5f3ed] p-4 sm:grid-cols-4">
                <div><p className="text-xs text-muted-foreground">Archivo</p><p className="mt-1 truncate text-sm font-medium">{importView.fileName}</p></div>
                <div><p className="text-xs text-muted-foreground">Filas totales</p><p className="mt-1 font-mono text-lg font-semibold">{importView.totalRows}</p></div>
                <div><p className="text-xs text-muted-foreground">Aprobadas / rechazadas</p><p className="mt-1 font-mono text-lg font-semibold"><span className="text-emerald-800">{importView.approvedRows}</span> / <span className="text-rose-800">{importView.rejectedRows}</span></p></div>
                <div><p className="text-xs text-muted-foreground">Tiempo de respuesta</p><p className="mt-1 font-mono text-lg font-semibold">{responseTime(importView.responseTimeMs)}</p></div>
              </div>
              <div className="overflow-x-auto rounded-lg border">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground"><tr><th className="px-3 py-2.5">Fila</th><th className="px-3 py-2.5">Código / nombre</th><th className="px-3 py-2.5">Resultado</th><th className="px-3 py-2.5">Respuesta</th><th className="px-3 py-2.5 text-right">Tiempo</th></tr></thead>
                  <tbody>
                    {importView.results.map((result, index) => {
                      const rowNumber = 'rowNumber' in result ? result.rowNumber : index + 2;
                      return <tr key={`${result.id}-${index}`} className="border-t align-top" data-testid={`csv-result-row-${rowNumber}`}>
                        <td className="px-3 py-3 font-mono text-muted-foreground">{rowNumber}</td>
                        <td className="px-3 py-3"><p className="font-mono font-medium">{result.productCode || '—'}</p><p className="mt-0.5 text-xs text-muted-foreground">{result.productName || '—'}</p></td>
                        <td className="px-3 py-3"><Outcome status={result.status} /></td>
                        <td className="px-3 py-3"><p className="font-mono text-xs">{result.responseCode}</p><p className="mt-1 max-w-md text-xs leading-4 text-muted-foreground">{result.responseMessage}</p></td>
                        <td className="px-3 py-3 text-right font-mono text-xs">{responseTime(result.responseTimeMs)}</td>
                      </tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.05fr_1fr]">
        <Card className="border-card-border">
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div><CardTitle className="font-serif text-xl">Catálogo registrado</CardTitle><CardDescription>Categorías y productos recibidos desde el servidor.</CardDescription></div>
            <Button variant="outline" size="sm" onClick={() => dashboardQuery.refetch()} disabled={dashboardQuery.isFetching} data-testid="button-refresh-catalog">{dashboardQuery.isFetching ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <RotateCw className="h-4 w-4" />}<span className="sr-only">Actualizar catálogo</span></Button>
          </CardHeader>
          <CardContent className="space-y-5">
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Categorías · {categories.length}</h3>
              {categories.length === 0 ? <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Todavía no hay categorías. Registre la primera para comenzar.</p> : <div className="space-y-2">{categories.map((category) => {
                const productCount = products.filter((product) => product.categoryId === category.id).length;
                return <div key={category.id} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5" data-testid={`category-row-${category.id}`}><div className="min-w-0"><p className="truncate text-sm font-medium">{category.name}</p><p className="font-mono text-xs text-muted-foreground">{category.code}</p></div><span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">{productCount} productos</span></div>;
              })}</div>}
            </div>
            <div>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Productos · {products.length}</h3>
              {products.length === 0 ? <p className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Los productos registrados aparecerán aquí.</p> : <div className="max-h-72 space-y-2 overflow-y-auto pr-1">{products.map((product) => <div key={product.id} className="grid grid-cols-[1fr_auto] gap-3 rounded-md border px-3 py-2.5 sm:grid-cols-[1fr_1fr_auto] sm:items-center" data-testid={`product-row-${product.id}`}><div className="min-w-0"><p className="truncate text-sm font-medium">{product.name}</p><p className="font-mono text-xs text-muted-foreground">{product.code}</p></div><p className="hidden truncate text-xs text-muted-foreground sm:block">{product.categoryName}</p><span className="text-right font-mono text-sm">{product.quantity}</span></div>)}</div>}
            </div>
          </CardContent>
        </Card>

        <Card className="border-card-border">
          <CardHeader><CardTitle className="font-serif text-xl">Historial de operaciones</CardTitle><CardDescription>Eventos recientes, incluidas salidas aprobadas y rechazadas.</CardDescription></CardHeader>
          <CardContent>
            {latestEvent && <div className={`mb-4 rounded-lg border p-4 ${latestEvent.status === 'Aprobado' ? 'border-emerald-200 bg-emerald-50/60' : 'border-rose-200 bg-rose-50/60'}`} data-testid="most-recent-outcome">
              <div className="flex flex-wrap items-center justify-between gap-2"><div className="flex items-center gap-2"><span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Última salida</span><Outcome status={latestEvent.status} /></div><span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock3 className="h-3.5 w-3.5" />{responseTime(latestEvent.responseTimeMs)}</span></div>
              <p className="mt-2 text-sm font-medium">{latestEvent.responseMessage}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{latestEvent.action} · {latestEvent.responseCode}</p>
            </div>}
            {events.length === 0 ? <div className="flex flex-col items-center rounded-lg border border-dashed px-5 py-10 text-center" data-testid="empty-operation-history"><span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#e9eef0] text-[#3e5a64]"><Activity className="h-5 w-5" /></span><p className="text-sm font-medium">Aún no hay operaciones</p><p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">Las evaluaciones, verificaciones y cargas CSV aparecerán aquí después de ejecutarse.</p></div> : <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">{events.map((event) => <div key={event.id} className="rounded-md border px-3 py-3" data-testid={`operation-event-${event.id}`}><div className="flex flex-wrap items-center justify-between gap-2"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold">{event.action}</span><Outcome status={event.status} /></div><span className="font-mono text-[11px] text-muted-foreground">{responseTime(event.responseTimeMs)}</span></div><p className="mt-2 text-sm leading-5">{event.responseMessage}</p><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-muted-foreground"><span>Respuesta <strong className="font-mono text-foreground">{event.responseCode}</strong></span>{event.productCode && <span>Código <strong className="font-mono text-foreground">{event.productCode}</strong></span>}{event.sourceFileName && <span className="max-w-40 truncate">Archivo {event.sourceFileName}</span>}<span>{new Date(event.createdAt).toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })}</span></div></div>)}</div>}
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0 text-[#8a7440]" /> Uso académico: los resultados describen únicamente las reglas del catálogo de demostración.
      </div>
    </div>
  );
}
