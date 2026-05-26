/**
 * Silencia log/info/warn/debug en el navegador; deja console.error intacto.
 * Importar una sola vez al arranque (main.tsx).
 */
export function suppressNonErrorConsole(): void {
  const noop = (): void => undefined;
  console.log = noop;
  console.info = noop;
  console.debug = noop;
  console.warn = noop;
}
