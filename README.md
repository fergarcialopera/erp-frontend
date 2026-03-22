# LockERP — ERP MVP (Frontend)

Frontend del ERP (MVP) para clínicas con lockers y compartimentos. Multi-tenant por `clinic_id`. Backoffice para administradores y responsables; rol de solo lectura (READONLY) para consulta.

## Requisitos

- **Node.js** 18+ y **npm**
- Backend API (opcional para desarrollo: la UI maneja errores y estados vacíos si la API no está disponible)

## Variables de entorno

Crea un archivo `.env` en la raíz (o `.env.local`):

| Variable                 | Descripción                          | Por defecto   |
|--------------------------|--------------------------------------|---------------|
| `VITE_API_BASE_URL`      | URL base del backend (sin basepath)  | Proxy / `localhost:8000` |
| `VITE_API_BASEPATH`      | BasePath de la API (ej. `/api/v1`)   | `/api/v1`     |
| `VITE_LOGIN_FORMAT`      | `json` o `form` (form-urlencoded)    | `json`        |
| `VITE_LOGIN_USER_FIELD`  | `email` o `username`                 | `email`       |

Ejemplo:

```env
VITE_API_BASE_URL=http://localhost:8000
# Si el backend espera form-urlencoded con "username":
# VITE_LOGIN_FORMAT=form
# VITE_LOGIN_USER_FIELD=username
```

- **En desarrollo sin `.env`**: las peticiones van al mismo origen (`/api/v1/...`) y Vite las reenvía al backend vía proxy. El backend debe estar en `http://localhost:8000`.
- **Con `.env` o en producción**: las peticiones van directamente a `VITE_API_BASE_URL/api/v1/...`.

**Importante**: El backend debe exponer las rutas que usa el frontend. Si ves errores como "The route api/v1/products could not be found", el backend no tiene esa ruta registrada. Ver tabla de rutas esperadas más abajo.

### Login: formato del body

Por defecto el frontend envía JSON: `{ "email": "...", "password": "..." }` con `Content-Type: application/json`.

Si en Postman el login funciona con otro formato, ajusta en `.env`:
- **Form-urlencoded** (FastAPI OAuth2, etc.): `VITE_LOGIN_FORMAT=form`
- **Campo "username" en vez de "email"**: `VITE_LOGIN_USER_FIELD=username`

## Comandos

```bash
# Instalar dependencias
npm install

# Desarrollo (puerto 8080)
npm run dev

# Build de producción
npm run build

# Vista previa del build
npm run preview

# Lint
npm run lint
npm run lint:fix

# Formatear código (Prettier)
npm run format
npm run format:check

# Tests
npm run test
```

## API — BasePath y headers

- **BasePath**: `/api/v1` por defecto (configurable con `VITE_API_BASEPATH`).
- **Autenticación**: header `Authorization: Bearer <token>` (token tras `POST /api/v1/auth/login`).
- **Clinic scope**: header `X-Clinic-Id: <clinic_id>` en todas las peticiones autenticadas.

### Logout (`POST /api/v1/auth/logout`)

El frontend llama a este endpoint al cerrar sesión. **El backend debe invalidar el token** (p. ej. añadirlo a una blacklist o revocar la sesión) para que no vuelva a ser válido hasta un nuevo login. El frontend envía el token en `Authorization`; tras la llamada, limpia el almacenamiento local y recarga la app.

El cliente Axios (`src/lib/apiClient.ts`) añade estos headers y maneja:

- **401**: cierre de sesión y redirección a `/login`.
- **403**: toast "Sin permisos".
- Otros errores: toast con mensaje normalizado.

### Rutas del backend Laravel (prefix `v1`)

Contrato detallado: OpenAPI en `{backend}/api-docs.json` (proyecto `lock-erp`, `docs/openapi.yaml`).

| Método | Ruta | Uso |
|--------|------|-----|
| POST | `/auth/login` | Login |
| POST | `/auth/logout` | Logout |
| GET | `/clinic` | Clínica del usuario |
| PATCH | `/clinic/settings` | Actualizar configuración clínica |
| GET | `/dashboard` | Dashboard (`pending_dispenses_count`, `latest_dispenses`, …) |
| GET | `/inventory` | Inventario enriquecido (query opcional `compartment_id`) |
| POST | `/inventory/adjust` | Ajustar `qty_available` |
| POST | `/inventory/add` | Añadir unidades |
| POST | `/inventory/remove` | Retirar unidades y **crear dispensación** (PENDING) |
| DELETE | `/inventory/{id}` | Eliminar entrada |
| GET | `/dispenses` | Listado dispensaciones (query opcional `status`) |
| GET | `/dispenses/{id}` | Detalle dispensación |
| POST | `/dispenses/{id}/confirm-read` | Confirmar lectura / retiro |
| GET/POST/PATCH/DELETE | `/products`, `/users`, `/lockers`, `/compartments` | CRUD según OpenAPI |

*La pantalla “Nueva orden” solicita retirada vía `POST /inventory/remove` (no existe `POST /dispenses`).*

## Estructura principal de `/src`

- `app/` — providers (Auth), rutas (Login, Dashboard, Products, etc.).
- `features/` — por recurso: `auth`, `clinics`, `users`, `lockers`, `compartments`, `products`, `inventory`, `openOrders` (dispensaciones + alta vía `inventory/remove`), `auditLogs`.
- `components/` — UI compartida, DataTable, EmptyState, layouts, shadcn/ui.
- `lib/` — apiClient, utils, hooks.
- `types/` — modelos de dominio y auth.
- `config/` — env y endpoints.

## Cómo probar en local

1. `npm install`
2. `npm run dev`
3. Abre `http://localhost:8080` (o el puerto que indique Vite).
4. **Sin backend**: usa "Acceso demo (Admin)" en la pantalla de login para entrar con usuario de prueba; las pantallas cargarán vacías o en estado de error con opción "Reintentar" (toasts si la API falla).
5. **Con backend**: configura `VITE_API_BASE_URL` y haz login con credenciales reales; las peticiones irán a `/api/v1/...` con token y `X-Clinic-Id`.

## Rutas principales

- `/login` — Inicio de sesión (y demo).
- `/dashboard` — Resumen.
- `/products`, `/inventory`, `/lockers`, `/lockers/:id`, `/open-orders`, `/open-orders/new` — Operaciones (RESPONSABLE o ADMIN según pantalla).
- `/users`, `/audit-logs` — Solo ADMIN.

## Notas

- Si el backend no está levantado, la UI no se rompe: se muestran toasts de error y estados vacíos o de error con "Reintentar".
- Los tipos en `src/types/models.ts` reflejan el dominio (snake_case del backend: User, Locker, Compartment, Product, CompartmentInventory, OpenOrder, AuditLog, etc.).
- Paleta y tema: no modificar (Tailwind/shadcn con colores del ERP).
