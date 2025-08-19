export interface FetchJsonError<T = unknown> {
  status: number;
  data: T;
  message: string;
}

export async function fetchJson<T, E = unknown>(
  input: RequestInfo | URL,
  init: (RequestInit & { retries?: number }) = {},
): Promise<T> {
  const { retries = 0, signal: externalSignal, ...rest } = init;
  const controller = new AbortController();
  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort((externalSignal as any).reason);
    } else {
      externalSignal.addEventListener(
        'abort',
        () => controller.abort((externalSignal as any).reason),
        { once: true },
      );
    }
  }
  let attempt = 0;
  let delay = 500;
  while (true) {
    try {
      const res = await fetch(input, { ...rest, signal: controller.signal });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw {
          status: res.status,
          data: data as E,
          message:
            (data && (data.message || data.error || data.detail)) ||
            res.statusText,
        } as FetchJsonError<E>;
      }
      return data as T;
    } catch (err: unknown) {
      if ((err as any)?.name === 'AbortError') throw err;
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, delay));
      attempt++;
      delay *= 2;
    }
  }
}
