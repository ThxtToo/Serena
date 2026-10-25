# Serena — Sistema de Gestión Funeraria y Asistencia de Crisis

Serena es una plataforma web integral diseñada para la gestión operativa funeraria, verificación automatizada de pólizas de seguro, administración de inventarios (salas, vehículos y cofres), registro de catálogo de servicios y asistencia inteligente con IA durante momentos de crisis.

## Stack Tecnológico

- **Monorepo**: pnpm workspaces
- **Node.js**: v24.x
- **TypeScript**: v5.9
- **Backend**: Express 5 (`@workspace/api-server`)
- **Base de Datos**: PostgreSQL + Drizzle ORM (`@workspace/db`)
- **Validación**: Zod (`zod`), `drizzle-zod` (`@workspace/api-zod`)
- **API Spec & Codegen**: OpenAPI 3.1 (`lib/api-spec/openapi.yaml`) + Orval (`@workspace/api-client-react`)
- **Frontend Principal**: React 18 + Vite + Tailwind CSS + Lucide Icons + Shadcn UI (`artifacts/serena`)
- **Sandbox Mockup**: Vite + React (`artifacts/mockup-sandbox`)

---

## Estructura del Monorepo

```
.
├── artifacts/
│   ├── api-server/         # Servidor API Express (Puerto 5000)
│   ├── serena/             # Aplicación Frontend Principal React + Vite
│   └── mockup-sandbox/     # Entorno de pruebas de prototipos UI
├── lib/
│   ├── api-spec/           # Definición OpenAPI 3.1 (`openapi.yaml`) y config de Orval
│   ├── api-client-react/   # Hooks y API client generados automáticamente por Orval
│   ├── api-zod/            # Schemas Zod generados automáticamente
│   └── db/                 # Esquemas Drizzle ORM y conexión a PostgreSQL
├── scripts/                # Scripts auxiliares y utilidades de compilación
├── CONTRIBUTING.md         # Guía para desarrolladores y colaboradores
└── replit.md               # Este archivo de arquitectura y documentación
```

---

## Comandos Principales

### Desarrollar y Ejecutar
- `pnpm --filter @workspace/api-server run dev` — Ejecutar el servidor API en modo desarrollo (Puerto 5000)
- `pnpm --filter @workspace/serena run dev` — Ejecutar la aplicación web frontend Serena
- `pnpm --filter @workspace/api-spec run codegen` — Regenerar los hooks React y esquemas Zod a partir de `openapi.yaml`
- `pnpm --filter @workspace/db run push` — Aplicar cambios del esquema Drizzle a la base de datos de desarrollo

### Verificación y Compilación
- `pnpm run typecheck` — Verificación de tipos TypeScript en todo el monorepo
- `pnpm run build` — Verificación de tipos y compilación de todos los paquetes y artifacts

### Alojamiento y Despliegue Web
- **GitHub Pages**: Configurado mediante `.github/workflows/deploy-pages.yml`.
  - Al hacer push a `main`/`master`, GitHub Actions compila automáticamente el frontend y lo despliega en `https://ThxtToo.github.io/Serena/`.

---

## Variables de Entorno

- `DATABASE_URL`: Cadena de conexión a PostgreSQL (Ej: `postgres://user:pass@localhost:5432/serena_db`). Si no se proporciona, el servidor opera con el almacén de datos en memoria para pruebas.
- `PORT`: Puerto para `api-server` (por defecto `5000`).

---

## Guía de Arquitectura del Flujo de Datos API (Contract-First)

El proyecto sigue una arquitectura **Contract-First**:

1. **Definición de Contrato**: La especificación OpenAPI vive en `lib/api-spec/openapi.yaml`.
2. **Generación de Código**:
   Ejecutar `pnpm --filter @workspace/api-spec run codegen`.
   Esto actualiza automáticamente:
   - `@workspace/api-client-react`: React Hooks con TanStack Query y llamadas de fetch.
   - `@workspace/api-zod`: Schemas de validación Zod.
3. **Implementación de Endpoints**: Se crean las rutas Express en `artifacts/api-server/src/routes/`.
4. **Consumo en Frontend**: Los componentes en `artifacts/serena/src/` importan directamente los hooks auto-generados de `@workspace/api-client-react`.

---

## Autonomía del Equipo

Para permitir que el equipo de desarrollo continúe expandiendo y manteniendo el proyecto de forma independiente sin depender de un único desarrollador, consulta la guía detallada en [`CONTRIBUTING.md`](./CONTRIBUTING.md).
