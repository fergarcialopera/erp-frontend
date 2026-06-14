/** Credenciales válidas pero el usuario no es SUPER_ADMIN. */
export class SuperAdminLoginError extends Error {
  constructor(
    message = "Esta cuenta no tiene permisos de super administrador.",
  ) {
    super(message);
    this.name = "SuperAdminLoginError";
  }
}

export function isSuperAdminLoginError(error: unknown): error is SuperAdminLoginError {
  return error instanceof SuperAdminLoginError;
}
