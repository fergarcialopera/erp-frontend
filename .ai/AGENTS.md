# AGENTS.md - Instrucciones globales para agentes IA

Este archivo define el contexto operativo del proyecto frontend y debe cargarse siempre en cualquier IDE/agente de IA que vaya a trabajar en este repositorio.

## 1. Objetivo del proyecto

Aplicacion frontend para gestion de inventario clinico con ambientes.

- Backend esperado: `http://localhost:8080`
- Frontend esperado: `http://localhost:8081`
- Stack principal: React + TypeScript + Vite + TanStack Query + Axios + Tailwind

## 2. Requisitos y entorno local

- Usar Node.js 18+ (LTS recomendado).
- Instalar dependencias con `npm install`.
- Configurar `.env.local` en la raiz (puede copiarse de `.env.example`).

Variables minimas recomendadas:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_API_BASEPATH=/api/v1
```

Variables opcionales de login:

```env
VITE_LOGIN_FORMAT=form
VITE_LOGIN_USER_FIELD=username
```

Tras cambiar variables de entorno, reiniciar `npm run dev`.

## 3. Estructura y convenciones de codigo

Respetar la organizacion existente:

- `src/app/routes`: pantallas y rutas.
- `src/features`: logica por dominio y acceso API.
- `src/components`: componentes reutilizables de UI.
- `src/lib`: cliente HTTP y utilidades compartidas.
- `src/types`: tipos de dominio.
- `src/config`: entorno, endpoints y configuracion.

Reglas de implementacion:

- Aplicar principio de minimo impacto: modificar solo lo necesario.
- Mantener patrones existentes por modulo (no introducir arquitecturas paralelas).
- Centralizar endpoints en `src/config/endpoints.ts`.
- Reutilizar `src/lib/apiClient.ts` para llamadas HTTP.
- Mantener consistencia con contratos del backend; evitar compatibilidades ocultas.

## 4. Rutas y control de acceso

Rutas principales:

- `/login`
- `/dashboard`
- `/inventory`
- `/entry-logs/new`
- `/exit-logs`
- `/exit-logs/new`
- `/products`
- `/ambientes`
- `/users`
- `/audit-logs`

Consideraciones de permisos:

- Existen rutas protegidas por rol (`ADMIN`, `TECHNICIAN`) mediante `ProtectedRoute`.
- No romper controles de autorizacion existentes al agregar o mover rutas.

## 5. Flujo de trabajo para agentes IA

Antes de implementar:

1. Leer este archivo y `README.md`.
2. Investigar el contexto y el codigo actual del modulo afectado.
3. Proponer un plan de accion claro, en pasos verificables.
4. Obtener confirmacion explicita del usuario antes de ejecutar el plan.
5. Elegir la solucion mas simple y mantenible una vez confirmado el plan.

Durante la implementacion:

1. Hacer cambios pequenos y enfocados.
2. Evitar refactors amplios si no son estrictamente necesarios.
3. Mantener naming y estilo del proyecto.

Antes de marcar una tarea como completada:

1. Ejecutar `npm run lint`.
2. Ejecutar `npm run test`.
3. Ejecutar `npm run build`.
4. Verificar que no se rompen rutas, permisos ni consumo de API.

Si hay errores:

- Depurar de forma autonoma revisando tests/logs/codigo afectado.
- No dar la tarea por cerrada hasta dejar validacion en verde o explicar bloqueo real.

## 6. Scripts de referencia

- `npm run dev`: servidor de desarrollo.
- `npm run build`: build de produccion.
- `npm run lint`: analisis estatico con ESLint.
- `npm run lint:fix`: correcciones automaticas de lint cuando proceda.
- `npm run format`: formateo con Prettier.
- `npm run format:check`: comprobacion de formato.
- `npm run test`: tests unitarios/integracion con Vitest.
- `npm run test:watch`: tests en modo watch.

## 7. Criterios de calidad

- Priorizar claridad y mantenibilidad sobre soluciones rapidas.
- No introducir cambios de comportamiento fuera del alcance solicitado.
- Documentar decisiones no obvias con comentarios breves en codigo cuando sea necesario.
- Si se tocan contratos API, contrastar con documentacion backend (`/docs` en local).

## 8. Definicion de completitud (DoD)

Una tarea solo se considera completa cuando:

- El cambio implementa el requerimiento solicitado.
- Lint, tests y build pasan.
- No hay regresiones evidentes en rutas, permisos o API.
- Se deja el codigo coherente con las convenciones del repositorio.
