# LogiLock Frontend

Aplicación frontend para gestión de inventario clínico con ambientes.

**Agentes de IA:** [`AGENTS.md`](AGENTS.md) · dominio [`.ai/PROJECT.md`](.ai/PROJECT.md) · calidad [`.ai/QUALITY.md`](.ai/QUALITY.md).

---

## Requisitos

- Git, Node.js **18+** (LTS recomendado), npm
- Editor: VS Code o Cursor

```bash
git --version && node -v && npm -v
```

## Arquitectura local

| Servicio | URL |
|---|---|
| Backend API | `http://localhost:8080` |
| Frontend (Vite) | `http://localhost:8081` |

No uses el mismo puerto para ambos.

## Instalación y entorno

```bash
npm install
```

Crea `.env.local` en la raíz (puedes partir de `.env.example`):

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_API_BASEPATH=/api/v1
# VITE_LOGIN_FORMAT=form
# VITE_LOGIN_USER_FIELD=username
```

Variables y defaults: [`.ai/PROJECT.md`](.ai/PROJECT.md) §2 y `.env.example`.

## Arranque

1. Backend en `8080`.
2. `npm run dev` → [http://localhost:8081](http://localhost:8081).
3. Inicia sesión con un usuario real del backend.

Tras cambiar variables de entorno, reinicia `npm run dev`.

## Scripts

```bash
npm run dev       # desarrollo
npm run build     # build de producción
npm run verify    # lint + test + build (gate local / CI / deploy)
```

Más detalle: [`.ai/QUALITY.md`](.ai/QUALITY.md).

## Rutas y código

Resumen: app **clínica** (`/dashboard`, inventario, salidas, incidencias…) y **plataforma** SUPER_ADMIN (`/platform/*`).  
Mapa de rutas, roles y estructura de carpetas: [`.ai/PROJECT.md`](.ai/PROJECT.md).

## Problemas comunes

- **No cargan datos:** backend en `:8080`, `.env.local` correcto, reiniciar `npm run dev`.
- **CORS / red:** puertos 8080/8081; el backend debe aceptar origen `http://localhost:8081`.
- **Puerto 8081 ocupado:** liberarlo o cambiarlo en `vite.config.ts`.
- **`npm install` falla:** borrar `node_modules` y reinstalar (`npm install`). Si el lock está corrupto, regenerarlo con cuidado y validar con `npm run verify`.

## Política de versiones de dependencias

Versiones **exactas** en `package.json` (`.npmrc` → `save-exact=true`). Sin Dependabot ni bots. Fuente de verdad: `package.json` + `package-lock.json` (CI usa `npm ci`).

```bash
npm outdated
npm install <paquete>@<versión>
npm ci
npm run verify
```

Commitear `package.json` y `package-lock.json` juntos. Grupos que deben actualizarse en bloque (React, Vite, ESLint) y reglas de CI: [`.ai/PROJECT.md`](.ai/PROJECT.md) §8.

Los cambios de **major** requieren PR dedicado con revisión de *breaking changes*.

## PWA y cámara

La app es instalable como PWA (HTTPS en producción). Desde el móvil puedes «Instalar» / «Añadir a pantalla de inicio» y escanear códigos de barras en salidas y entradas.

Detalle: [`.ai/PROJECT.md`](.ai/PROJECT.md) §§10–11.

## Para desarrolladores nuevos

- Validar con `npm run verify` antes de dar por cerrado un cambio.
- Contratos API: [http://localhost:8080/docs](http://localhost:8080/docs) — sin “compatibilidades ocultas”.
- Agentes: seguir [`AGENTS.md`](AGENTS.md).
