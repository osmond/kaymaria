export interface FetchJsonError {
  status: number;
  data: any;
  message: string;
}

export async function fetchJson<T>(
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
          data,
          message:
            (data && (data.message || data.error || data.detail)) ||
            res.statusText,
        } as FetchJsonError;
      }
      return data as T;
    } catch (err: any) {
      if (err?.name === 'AbortError') throw err;
      if (attempt >= retries) throw err;
      await new Promise((r) => setTimeout(r, delay));
      attempt++;
      delay *= 2;
    }
  }
}
