# QUALITY.md — Calidad, testing y definición de completitud

Procedimientos de verificación para agentes y desarrolladores.
Comandos ejecutables desde terminal (independientes del IDE).

## 1. Verificación reproducible

Antes de dar una tarea por cerrada:

```bash
npm run verify
```

Equivale a `lint` → `test` → `build` en ese orden.

Opcionales según el cambio:

```bash
npm run format:check   # si se tocó formato/estilo de forma amplia
npm run lint:fix      # solo si hay que aplicar fixes automáticos de ESLint/Prettier
```

Desarrollo:

```bash
npm run dev            # servidor en :8081
npm run test:watch     # tests en watch
```

Automatización:

- CI (PRs y pushes fuera de `main`): `.github/workflows/ci.yml` → `npm ci` + `npm run verify`
- Deploy (`main`): `.github/workflows/deploy.yml` → `npm ci` + `npm run verify` **antes** de `rsync`

## 2. Testing pragmático (basado en riesgo)

Framework: Vitest. Patrones: `src/**/*.{test,spec}.{ts,tsx}`. Setup: `src/test/setup.ts`.

### Priorizar tests cuando el cambio toque

- Reglas de negocio y cálculos (p. ej. planificación de salidas, elegibilidad de entradas).
- Auth, roles, permisos y normalización de sesión/login.
- Integridad de payloads hacia la API (builders/mappers).
- Contratos de tipos/parsers que evitan regresiones silenciosas.
- Regresiones ya conocidas o bugs corregidos.

### Evitar

- Tests triviales sin aserción de comportamiento (`expect(true)`).
- Duplicar el mismo escenario en unitario + integración sin valor añadido.
- Mocks innecesarios o tests acoplados a detalles internos frágiles.
- Suite lenta o E2E sin justificación (hoy no hay E2E en el repo).

### Dónde colocarlos

- Junto a la unidad pura: `feature/fooBar.test.ts` al lado de `fooBar.ts`.
- Preferir funciones puras testeables; no forzar tests de UI si la lógica puede extraerse.
- La cobertura de líneas es **diagnóstico**, no objetivo numérico.

Modelo de referencia en el repo: tests de `src/features/exitLogs/` y `src/features/auth/`.

## 3. Seguridad (frontend)

- No debilitar ni omitir `ProtectedRoute` / guards de clínica o plataforma.
- No persistir secretos en el repo; no loguear tokens.
- Respetar `authMode` del `apiClient` (`user` | `clinic` | `none`).
- No introducir XSS deliberado (evitar `dangerouslySetInnerHTML` sin sanitizar).
- Cámara: solo tras gesto del usuario; detener tracks al cerrar el escáner; no grabar ni subir vídeo.
- Cambios de dependencias: política en `.ai/PROJECT.md` §8; no usar `--force` / `--legacy-peer-deps` en CI.
- No modificar workflows de deploy ni secrets sin autorización explícita.

## 4. Calidad de código

- Tipado TypeScript coherente con el módulo; no añadir `any` nuevos sin necesidad.
- ESLint + Prettier del proyecto; no desactivar reglas en bloque.
- Accesibilidad básica en UI nueva: labels, roles, foco en diálogos.
- No cambiar comportamiento fuera del alcance del plan aprobado.
- Comentarios solo para decisiones no obvias.

## 5. Definición de completitud (DoD)

Una tarea está completa solo si:

1. Cumple el requerimiento / plan aprobado.
2. `npm run verify` pasa (lint, test y build).
3. No hay regresiones evidentes en rutas, permisos o consumo de API.
4. Hay tests nuevos o actualizados cuando el riesgo lo justifica (§2).
5. La documentación de agentes (PROJECT/AGENTS/specs) se actualizó si cambió el mapa del sistema.
6. Se entregan evidencias breves (comandos + resultado).

Si un gate falla y no puede resolverse de forma autónoma, **no** marcar completo: explicar el bloqueo.
