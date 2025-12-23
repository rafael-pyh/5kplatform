import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function useLeadSuccess(redirectPath = '/', seconds = 5) {
  const router = useRouter();
  const [remaining, setRemaining] = useState<number>(seconds);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining((r) => Math.max(0, r - 1));
    }, 1000);

    const timeout = setTimeout(() => {
      router.push(redirectPath);
    }, seconds * 1000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [router, redirectPath, seconds]);

  return { remaining };
}
