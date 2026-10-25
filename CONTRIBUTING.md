# Guía de Contribución y Desarrollo Autónomo — Proyecto Serena

Esta guía está diseñada para que cualquier miembro del equipo pueda continuar extendiendo, manteniendo y mejorando la plataforma web **Serena** sin depender del desarrollador original.

---

## 1. Estructura de Trabajo e Instalación

Serena utiliza un monorepo gestionado por **pnpm workspaces**. Para comenzar a trabajar:

1. **Instalar dependencias**:
   ```bash
   pnpm install
   ```
2. **Verificar el estado del código**:
   ```bash
   pnpm run typecheck
   ```
3. **Ejecutar el backend (API Server)**:
   ```bash
   pnpm --filter @workspace/api-server run dev
   ```
4. **Ejecutar el frontend (Serena UI)**:
   ```bash
   pnpm --filter @workspace/serena run dev
   ```

---

## 2. Flujo Contract-First: Cómo Agregar o Modificar un Endpoint de API

En este proyecto, la especificación de la API es la **fuente de verdad**. Para agregar o modificar endpoints:

1. **Editar el archivo OpenAPI**:
   Abre `lib/api-spec/openapi.yaml` y añade la nueva ruta o actualiza los esquemas/parámetros requeridos.
2. **Generar los Hooks del Cliente y Schemas Zod**:
   Ejecuta:
   ```bash
   pnpm --filter @workspace/api-spec run codegen
   ```
   Esto actualizará automáticamente:
   - `lib/api-client-react/src/generated/api.ts` (Hooks React Query)
   - `lib/api-zod/src/generated/` (Esquemas de validación Zod)
3. **Implementar el Endpoint en el Backend**:
   Crea o modifica la ruta en `artifacts/api-server/src/routes/`. Asegúrate de registrar la ruta en `artifacts/api-server/src/routes/index.ts`.
4. **Consumir el Hook en el Frontend**:
   En el frontend (`artifacts/serena/src/`), importa el hook generado directamente desde `@workspace/api-client-react`.

---

## 3. Base de Datos y Persistencia con Drizzle ORM

Si deseas modificar las tablas o agregar nuevas entidades a la base de datos:

1. **Definir/Editar Esquemas**:
   Los esquemas de la base de datos están ubicados en `lib/db/src/schema/`.
2. **Exportar el nuevo esquema**:
   Asegúrate de exportarlo en `lib/db/src/schema/index.ts`.
3. **Sincronizar la Base de Datos**:
   Si tienes configurada la variable `DATABASE_URL`, ejecuta:
   ```bash
   pnpm --filter @workspace/db run push
   ```
4. **Almacén en Memoria de Respaldo**:
   Para desarrollo local o pruebas sin base de datos, el backend cuenta con un almacén de respaldo en `artifacts/api-server/src/data/store.ts`. Mantén sincronizado este archivo si agregas nuevas entidades secundarias.

---

## 4. Desarrollo Frontend en `artifacts/serena`

El frontend utiliza **React 18**, **Wouter** para enrutamiento, **Tailwind CSS** y **Shadcn UI**.

- **Rutas y Navegación**: Se configuran en `artifacts/serena/src/routes.tsx`.
- **Control de Roles**: Utiliza `<ProtectedRoute allowedRole="personal" />` o `allowedRole="usuario"` para restringir el acceso a las vistas.
- **Componentes UI**: Los componentes Shadcn/UI reusables están en `artifacts/serena/src/components/ui/`.
- **Módulos del Dashboard**: Las vistas del operador están en `artifacts/serena/src/pages/dashboard/`:
  - `ingesta-casos.tsx`: Ingesta desde WhatsApp u OCR simulado.
  - `verificacion-polizas.tsx`: Búsqueda y estado de pólizas.
  - `stock-logistica.tsx`: Control de inventario de salas, vehículos y cofres.
  - `generador-ordenes.tsx`: Contrato de servicio e impresión.
  - `registro-evaluacion.tsx`: Registro de categorías/productos y evaluación.
  - `agente-serena.tsx`: Asistente de IA.

---

## 5. Buenas Prácticas y Verificaciones Antes de Hacer Commit

Antes de subir cambios a la rama principal o abrir un Pull Request, ejecuta siempre los siguientes comandos para evitar romper la build:

```bash
# 1. Verificar la integridad de tipos en TypeScript
pnpm run typecheck

# 2. Verificar que todo compile correctamente
pnpm run build
```

---

## 6. Despliegue Automático en GitHub Pages

El proyecto cuenta con un workflow de **GitHub Actions** en `.github/workflows/deploy-pages.yml` que compila y publica automáticamente la interfaz web en GitHub Pages cada vez que se envía un cambio a la rama principal (`main` / `master`).

### Pasos para activar GitHub Pages en el repositorio:
1. Dirígete a tu repositorio en GitHub: `https://github.com/ThxtToo/Serena`
2. Ve a la pestaña **Settings** (Configuración) -> **Pages**.
3. En la sección **Build and deployment** -> **Source**, selecciona **GitHub Actions**.
4. ¡Listo! Cada vez que hagas `push` o fusiones cambios, GitHub Actions compilará la app y desplegará la web en la URL pública: `https://ThxtToo.github.io/Serena/`

---

## 7. Credenciales de Prueba por Defecto

Para probar la aplicación localmente o en la web desplegada sin crear cuentas nuevas:

- **Operador / Personal Funerario**:
  - Email: `admin@serena.com`
  - Contraseña: `admin123`
- **Cliente / Usuario Externo**:
  - Email: `cliente@serena.com`
  - Contraseña: `cliente123`
