# AGENTS.md — Orquestador para agentes de IA

Punto de entrada portable del sistema de agentes de **LogiLock Frontend**.
Léelo siempre al inicio de una tarea. Los detalles de dominio y calidad viven en `.ai/`.

## Documentos del sistema

| Documento | Cuándo consultarlo |
|---|---|
| [`.ai/PROJECT.md`](.ai/PROJECT.md) | Stack, estructura, auth, rutas, convenciones, API |
| [`.ai/QUALITY.md`](.ai/QUALITY.md) | Verificación, testing por riesgo, seguridad, DoD |
| [`README.md`](README.md) | Instalación y arranque local (humanos y agentes) |
| [`.ai/specs/`](.ai/specs/) | Requisitos, planes aprobados y evidencias (si existen) |

Adaptador Cursor (no portable): [`.cursor/rules/`](.cursor/rules/).

## Objetivo del producto

Frontend para gestión de inventario clínico con ambientes (ERP clínica + plataforma global SUPER_ADMIN).

- Backend local: `http://localhost:8080`
- Frontend local: `http://localhost:8081`

## Flujo de trabajo (autonomía supervisada)

### Antes de implementar

1. Leer este archivo, luego `.ai/PROJECT.md` y `.ai/QUALITY.md`.
2. Si hay spec en `.ai/specs/`, usarla como fuente de requisitos.
3. Inspeccionar el código del módulo afectado (no inventar arquitectura).
4. Elaborar un **plan** en pasos verificables, con criterios de aceptación.
5. **Esperar aprobación explícita** del usuario antes de cambiar código funcional.

### Tras la aprobación

1. Implementar el plan de forma autónoma (decisiones técnicas rutinarias incluidas).
2. Cambios pequeños y enfocados; mínimo impacto; sin refactors amplios no pedidos.
3. Crear o actualizar pruebas según `.ai/QUALITY.md`.
4. Ejecutar `npm run verify` (detalle en `.ai/QUALITY.md`).
5. Corregir errores de forma autónoma hasta dejar la validación en verde (o reportar bloqueo real).
6. Actualizar documentación solo si cambió el mapa del sistema (rutas, auth, convenciones, contratos).
7. Entregar resultado con evidencias (comandos ejecutados y resultado).

### Pedir nueva autorización si

- Hay que apartarse del plan aprobado.
- Cambia significativamente la arquitectura o se introduce una tecnología relevante.
- Se modifican contratos externos de forma incompatible.
- Cambian requisitos de negocio.
- Hay operaciones destructivas (reset duro, borrado masivo, force push, etc.).
- Se toca producción o secretos de despliegue sin permiso explícito.
- Hace falta incumplir un estándar de `.ai/PROJECT.md` o `.ai/QUALITY.md`.

**No** interrumpir al usuario por naming local, detalles de estilo ya definidos o microdecisiones alineadas con el código existente.

## Principios permanentes

- Una sola arquitectura: respetar patrones del módulo tocado.
- Endpoints en `src/config/endpoints.ts`; HTTP vía `src/lib/apiClient.ts`.
- No romper guards de auth/roles/permisos.
- No crear “compatibilidades ocultas” con el backend; alinear el frontend al contrato real.
- Preferir la solución más simple y mantenible.

## Idioma

Responder al usuario en **español**, salvo que pida otra cosa.
