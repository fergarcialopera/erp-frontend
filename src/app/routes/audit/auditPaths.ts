export type AuditScopeProps = {
  platformScope?: boolean;
};

export function auditBasePath(platformScope = false): string {
  return platformScope ? "/platform/audit-logs" : "/audit-logs";
}
