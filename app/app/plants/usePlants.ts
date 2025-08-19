import useSWR from 'swr';

export type Plant = { id: string; name: string; room?: string; species?: string };

async function fetcher(url: string): Promise<Plant[]> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return res.json();
}

export default function usePlants() {
  const { data, error, isLoading, mutate } = useSWR<Plant[]>(
    '/api/plants',
    fetcher,
    {
      revalidateOnFocus: true,
      errorRetryInterval: 5000,
      errorRetryCount: 3,
    },
  );

  return {
    plants: data ?? null,
    error: error instanceof Error ? error.message : null,
    isLoading,
    mutate,
  };
}
