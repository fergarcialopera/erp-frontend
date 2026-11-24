# PROJECT.md — Configuración específica del proyecto

Fuente de verdad del **dominio técnico** de LogiLock Frontend.
Si este documento y el código discrepan, prevalece el código y este archivo debe actualizarse.

## 1. Stack

| Pieza | Tecnología |
|---|---|
| UI | React 18 + TypeScript |
| Bundler | Vite 8 (`@vitejs/plugin-react-swc`) |
| Datos servidor | TanStack Query 5 |
| HTTP | Axios (`src/lib/apiClient.ts`) |
| Routing | react-router-dom 6 |
| Estilos | Tailwind CSS 3 + shadcn/ui (Radix) |
| Formularios | react-hook-form + zod |
| Tests | Vitest + Testing Library + jsdom |
| Node | 18+ (CI usa 20) |
| Gestor | npm (`save-exact=true` en `.npmrc`) |

Puertos locales: backend `8080`, frontend `8081` (proxy Vite de `/api` → backend).

## 2. Entorno

Copiar `.env.example` → `.env.local` si hace falta. Tras cambiar env, reiniciar `npm run dev`.

| Variable | Descripción | Por defecto / notas |
|---|---|---|
| `VITE_API_BASE_URL` | Host API sin basepath | Vacío en dev → mismo origen + proxy |
| `VITE_API_BASEPATH` | Prefijo API | `/api/v1` |
| `VITE_LOGIN_FORMAT` | `json` \| `form` | `json` |
| `VITE_LOGIN_USER_FIELD` | `email` \| `username` | `email` |

Producción: `.env.production` (rutas relativas `/api/v1` en mismo dominio). Detalle humano en `README.md`.

## 3. Estructura de código

```
src/
  app/providers/     AuthContext, hooks de auth
  app/routes/        Páginas (clínica, audit/, platform/)
  features/          Dominio: api.ts, queries, componentes, lógica pura
  components/        UI compartida (layouts, ProtectedRoute, ui/)
  config/            env, endpoints, navigation, platformNavigation
  lib/               apiClient, authStorage, errores, utils
  types/             modelos y auth
  styles/            estilos globales auxiliares
  test/              setup de Vitest
```

### Convenciones de implementación

- Mínimo impacto: cambiar solo lo necesario.
- No introducir arquitecturas paralelas; seguir el patrón del feature tocado.
- Endpoints centralizados en `src/config/endpoints.ts`.
- Llamadas HTTP solo vía `src/lib/apiClient.ts` (modos `user` | `clinic` | `none`).
- Alias `@/` → `src/`.
- UI base: `src/components/ui` (shadcn); no duplicar primitivos.
- Contratos API alineados al backend; documentados en `http://localhost:8080/docs` cuando esté levantado.

## 4. Arquitectura de aplicaciones

Hay **dos superficies** tras el login:

1. **Clínica (ERP):** usuarios con permiso `clinicApp` (roles clínicos). Layout `AppLayout`.
2. **Plataforma:** solo `SUPER_ADMIN` (`superAdminPlatform`). Layout `PlatformLayout`, rutas bajo `/platform/*`.

`RoleHomeRedirect` (`/`): sin sesión → landing; SUPER_ADMIN → `/platform`; resto → `/dashboard`.

Guards: `ProtectedRoute`, `ClinicAppGuard`, `PlatformAppGuard` en `src/components/ProtectedRoute.tsx`.

## 5. Roles y permisos

### Roles (`Role`)

| Rol | Ámbito |
|---|---|
| `SUPER_ADMIN` | Plataforma global (no usa ERP clínico) |
| `ADMIN` | Clínica — configuración |
| `TECHNICIAN` | Clínica — gestión operativa |
| `STAFF` | Clínica — operaciones básicas |

Jerarquía clínica inclusiva: `STAFF` (1) < `TECHNICIAN` (2) < `ADMIN` (3). Definida en `src/types/auth.ts` y `src/config/navigation.ts`.

### Permisos (`AuthPermission`)

| Permiso | Quién |
|---|---|
| `clinicApp` | Roles clínicos (no SUPER_ADMIN) |
| `superAdminPlatform` | SUPER_ADMIN |
| `audit` | ADMIN o SUPER_ADMIN |
| `manageUsers` | SUPER_ADMIN |

### Roles mínimos clínicos habituales

| Nivel | Rol mínimo | Ejemplos |
|---|---|---|
| OPERATIONS | `STAFF` | Dashboard, salidas de stock |
| MANAGEMENT | `TECHNICIAN` | Inventario, productos, ambientes, incidencias |
| CONFIG | `ADMIN` | Ajustes de clínica / auditoría clínica |

Fuente canónica de mínimos por ruta clínica: `ROUTE_MIN_ROLE` en `src/config/navigation.ts`.

**No** simplificar el modelo a “solo ADMIN/TECHNICIAN”.

## 6. Mapa de rutas

Fuente canónica: `src/App.tsx`. Resumen:

### Públicas

- `/` — landing o redirección por rol
- `/login`
- `/recover`

### Clínica (auth + `clinicApp`)

| Ruta | Acceso adicional |
|---|---|
| `/dashboard` | autenticado clínico |
| `/exit-logs`, `/exit-logs/new` | autenticado clínico |
| `/inventory` | TECHNICIAN+ |
| `/products` | TECHNICIAN+ |
| `/ambientes`, `/ambientes/:id` | TECHNICIAN+ |
| `/incidents`, `/incidents/new` | TECHNICIAN+ |
| `/audit-logs`, `/audit-logs/access`, `/audit-logs/activity` | permiso `audit` |

**Entradas de stock:** no hay ruta `/entry-logs/new`. Se registran desde el diálogo en inventario (`NewEntryLogDialog` → `features/entryLogs`).

Redirect: `/users` → `/platform/users`.

### Plataforma (auth + `superAdminPlatform`)

- `/platform`
- `/platform/clinics`, `/platform/clinics/:id`
- `/platform/users`
- `/platform/products`
- `/platform/product-imports`, `/platform/product-imports/:id`
- `/platform/categories`, `/platform/subcategories`
- `/platform/brands`, `/platform/suppliers`
- `/platform/dispensing-types`, `/platform/roles`
- `/platform/ambientes`, `/platform/ambientes/:id`
- `/platform/incidents`
- `/platform/audit-logs` (+ `/access`, `/activity`) — además permiso `audit`

## 7. Features de dominio

Carpetas bajo `src/features/` (cada una con `api.ts` cuando aplica):  
`ambientes`, `auditLogs`, `auth`, `catalog`, `clinics`, `compartments`, `dashboard`, `entryLogs`, `exitLogs`, `incidents`, `inventory`, `landing`, `lockers`, `openOrders`, `productImports`, `products`, `users`, `zones`.

Al añadir API: endpoint en `endpoints.ts` + función en `features/<dominio>/api.ts` + queries/hooks del feature.

## 8. Dependencias y CI

- Versiones **exactas** en `package.json` (sin `^` / `~`); `.npmrc` → `save-exact=true`.
- Sin Dependabot ni bots de actualización automática.
- CI/Deploy: `npm ci` (nunca `npm install` en Actions); sin `--legacy-peer-deps` / `--force`.
- Tras cualquier cambio de deps: `npm ci` + `npm run verify`; commit conjunto de `package.json` + `package-lock.json`.

Grupos a actualizar **juntos** (misma major / peers alineados):

| Grupo | Paquetes |
|---|---|
| React | `react`, `react-dom`, `@types/react`, `@types/react-dom` |
| Vite | `vite`, `@vitejs/plugin-react-swc`, `vitest`, `lovable-tagger` |
| ESLint | `eslint`, `eslint-*`, `@eslint/*`, `typescript-eslint` |

Majors (React 18→19, Vite 8→9, etc.): PR dedicado con revisión de breaking changes.

Resumen para humanos: `README.md`. Adaptador Cursor: `.cursor/rules/github-actions-deps.mdc`.

## 9. Despliegue (referencia)

- Workflow: `.github/workflows/deploy.yml` (push a `main`).
- Gate: `npm ci` + `npm run verify` (lint, test, build) **antes** de `rsync` a VPS.
- Secrets en environment `VPS_IONOS.env`.
- CI en PRs y pushes fuera de `main`: `.github/workflows/ci.yml` (`npm run verify`).

## 10. PWA e instalación móvil

- Plugin: `vite-plugin-pwa` (manifest + service worker en build).
- Shell instalable (`display: standalone`); API `/api` en caché **NetworkOnly**.
- Banner de instalación: `src/components/PwaInstallBanner.tsx` (Chrome/Android; pista iOS Safari).
- Registro SW: `src/components/PwaRegister.tsx`.
- **HTTPS obligatorio** en dispositivos reales (cámara e instalación). `localhost` vale en desarrollo.
- Iconos: `public/favicon/web-app-manifest-*.png` (`any` + `maskable`).

## 11. Escaneo de códigos (cámara)

- Feature: `src/features/scanning/` (`BarcodeScannerDialog`, normalización y match exacto de barcode).
- Librería: `@zxing/browser` + `@zxing/library` vía `getUserMedia` (cámara trasera ideal).
- Integrado en: dashboard (salidas), `/exit-logs/new`, diálogo de entrada de inventario.
- El permiso de cámara se pide solo al abrir el escáner (gesto del usuario).

## 12. Limitaciones conocidas

- No hay suite E2E en el repo.
- La cobertura de tests es parcial; priorizar lógica de riesgo (ver `.ai/QUALITY.md`).
- El backend OpenAPI en local es la referencia de contratos; no hay copia versionada del OpenAPI en este frontend.
- iOS no dispara `beforeinstallprompt`; la instalación es manual («Añadir a pantalla de inicio»).
- El escáner requiere producto con `barcode` coincidente en catálogo; no crea productos nuevos.
