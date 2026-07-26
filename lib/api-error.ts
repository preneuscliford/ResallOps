export class SafeError extends Error {}

export function toApiErrorMessage(context: string, error: unknown, fallback: string) {
  console.error(`[api] ${context}`, error);
  return error instanceof SafeError ? error.message : fallback;
}
