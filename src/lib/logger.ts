import { invokeEdgeFunction } from './edgeFunctions';

export async function logAppError(input: {
  source: string;
  action: string;
  message: string;
  metadata?: Record<string, unknown>;
  severity?: 'info' | 'warning' | 'error';
}) {
  try {
    await invokeEdgeFunction('log-app-error', input, {
      requireAuth: false,
    });
  } catch {
    // Logging must never break user workflows.
  }
}
