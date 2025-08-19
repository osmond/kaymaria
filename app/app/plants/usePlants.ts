import { useCallback, useEffect, useState } from 'react';

export type Plant = { id: string; name: string; room?: string; species?: string };

export default function usePlants() {
  const [plants, setPlants] = useState<Plant[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPlants = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/plants', { cache: 'no-store' });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const data: Plant[] = await res.json();
      setPlants(data);
      setError(null);
    } catch (err) {
      setPlants(null);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlants();
  }, [fetchPlants]);

  return { plants, error, isLoading, mutate: fetchPlants };
}
