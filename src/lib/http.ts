export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit = {},
  timeoutMs = 30000,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const callerSignal = init.signal;
  const signal = mergeSignals(controller.signal, callerSignal);

  try {
    return await fetch(input, {
      ...init,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`Request timed out after ${Math.round(timeoutMs / 1000)} seconds. Please try again.`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

function mergeSignals(timeoutSignal: AbortSignal, callerSignal?: AbortSignal | null): AbortSignal {
  if (!callerSignal) return timeoutSignal;
  if (callerSignal.aborted) return callerSignal;

  const controller = new AbortController();
  const abort = () => controller.abort();
  timeoutSignal.addEventListener('abort', abort, { once: true });
  callerSignal.addEventListener('abort', abort, { once: true });
  return controller.signal;
}
