# LogiLock Frontend

Aplicación frontend para gestión de inventario clínico con ambientes.

---

## 1) Requisitos previos (instalaciones recomendadas)

Antes de empezar, asegúrate de tener instalado:

- `Git` (para clonar el repositorio)
- `Node.js` **18 o superior** (recomendado: versión LTS)
- `npm` (viene con Node.js)
- Un editor como **VS Code** o **Cursor**

### Comprobar que todo está instalado

En terminal:

```bash
git --version
node -v
npm -v
```

Si alguno falla, instálalo antes de continuar.

---

## 2) Arquitectura local (muy importante)

- **Backend API:** `http://localhost:8080`
- **Frontend (Vite):** `http://localhost:8081`

No uses el mismo puerto para backend y frontend.

---

## 3) Instalación del proyecto

```bash
npm install
```

Este comando descarga todas las dependencias del frontend.

---

## 4) Configuración de entorno

Crea un archivo `.env.local` en la raíz del proyecto (puedes copiar desde `.env.example`).

Ejemplo mínimo recomendado:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_API_BASEPATH=/api/v1
```

Opcionales de login (solo si tu backend lo requiere):

```env
# VITE_LOGIN_FORMAT=form
# VITE_LOGIN_USER_FIELD=username
```

---

## 5) Arranque en desarrollo

```bash
npm run dev
```

Después abre:

- [http://localhost:8081](http://localhost:8081)

---

## 6) Flujo recomendado para levantar todo

1. Levanta primero el backend en `8080`.
2. Levanta el frontend con `npm run dev`.
3. Abre `http://localhost:8081`.
4. Inicia sesión con un usuario real del backend.

---

## 7) Scripts útiles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Lint y tests
npm run lint
npm run test
```

---

## 8) Variables de entorno disponibles

| Variable | Descripción | Valor recomendado |
|---|---|---|
| `VITE_API_BASE_URL` | URL base del backend (sin basepath) | `http://localhost:8080` |
| `VITE_API_BASEPATH` | Prefijo de API | `/api/v1` |
| `VITE_LOGIN_FORMAT` | Formato del body de login (`json` o `form`) | `json` |
| `VITE_LOGIN_USER_FIELD` | Campo de usuario en login (`email` o `username`) | `email` |

---

## 9) Rutas principales de la aplicación

- `/login`
- `/dashboard`
- `/inventory` (solo lectura)
- `/entry-logs/new` (registrar entrada)
- `/exit-logs`
- `/exit-logs/new` (registrar salida)
- `/products`
- `/ambientes`
- `/users` (admin)
- `/audit-logs` (admin)

---

## 10) Estructura del código (resumen)

- `src/app/routes` -> pantallas/rutas
- `src/features` -> acceso a API y lógica por dominio
- `src/components` -> componentes reutilizables UI
- `src/lib` -> cliente HTTP y utilidades
- `src/types` -> tipos de dominio
- `src/config` -> entorno y endpoints

---

## 11) Problemas comunes y soluciones

- **La app no carga datos**
  - Verifica que el backend esté en `http://localhost:8080`.
  - Verifica `.env.local` y reinicia `npm run dev`.

- **Error de CORS o red**
  - Comprueba que backend y frontend estén en puertos correctos.
  - Revisa que el backend acepte origen `http://localhost:8081`.

- **Puerto ocupado**
  - Si `8081` está ocupado, libera el puerto o cambia temporalmente el puerto del frontend en `vite.config.ts`.

- **Cambiaste `.env.local` y no se aplica**
  - Detén y vuelve a levantar el frontend (`npm run dev`).

- **`npm install` falla**
  - Borra `node_modules` y `package-lock.json`, luego ejecuta `npm install` otra vez.

---

## 12) Política de versiones de dependencias

Este proyecto usa **versiones exactas** (sin `^` ni `~`) en `package.json`, y el archivo `.npmrc` (`save-exact=true`) garantiza que cualquier `npm install <paquete>` futuro también quede fijado.

- **No hay actualizaciones automáticas**: no existe Dependabot ni ningún bot que abra PRs de dependencias. Toda actualización es una decisión manual y consciente.
- **La fuente de verdad** es `package.json` + `package-lock.json`. CI instala con `npm ci`, que falla si no coinciden.

### Cómo actualizar una dependencia (proceso manual)

1. Revisa qué hay desactualizado:

```bash
npm outdated
```

2. Actualiza el paquete a una versión concreta (quedará fijada automáticamente por `.npmrc`):

```bash
npm install <paquete>@<versión>
```

3. Si el paquete tiene *peers* relacionados, actualízalos **juntos** en el mismo cambio:
   - React: `react`, `react-dom`, `@types/react`, `@types/react-dom` (misma major).
   - Vite: `vite`, `@vitejs/plugin-react-swc`, `vitest`, `lovable-tagger`.

4. Valida antes de commitear:

```bash
npm ci
npm run lint
npm run test
npm run build
```

5. Commitea `package.json` y `package-lock.json` en el mismo commit.

Los cambios de **major** (p. ej. React 18 → 19) requieren PR dedicado con revisión de *breaking changes*.

---

## 13) Recomendaciones para desarrolladores nuevos

- Haz cambios pequeños y valídalos con `npm run build`.
- Antes de enviar cambios, ejecuta `npm run lint`.
- Si tocas contratos API, revisa siempre la documentación del backend en:
  - [http://localhost:8080/docs](http://localhost:8080/docs)
- Evita crear “compatibilidades ocultas”: mantén el frontend alineado al dominio real de backend.
