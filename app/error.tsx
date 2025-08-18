'use client';

import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold">Something went wrong</h1>
      <button className="mt-4 underline" onClick={() => reset()}>Try again</button>
    </div>
  );
}
