export function toApiErrorMessage(context: string, error: unknown, fallback: string) {
  console.error(`[api] ${context}`, error);
  return fallback;
}
