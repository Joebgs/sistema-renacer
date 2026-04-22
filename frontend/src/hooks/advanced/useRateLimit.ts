import { useState, useCallback, useRef } from 'react';

interface RateLimitResult {
  canExecute: boolean;
  remainingTime: number;
}

export const useRateLimit = (maxRequests: number, windowMs: number): RateLimitResult & { execute: () => boolean } => {
  const [canExecute, setCanExecute] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);
  const requestsRef = useRef<number[]>([]);

  const execute = useCallback((): boolean => {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Limpiar requests antiguos
    requestsRef.current = requestsRef.current.filter(time => time > windowStart);

    if (requestsRef.current.length >= maxRequests) {
      const oldestRequest = requestsRef.current[0];
      const timeToWait = windowMs - (now - oldestRequest);
      setRemainingTime(timeToWait);
      setCanExecute(false);

      setTimeout(() => {
        setCanExecute(true);
        setRemainingTime(0);
      }, timeToWait);

      return false;
    }

    requestsRef.current.push(now);
    setCanExecute(true);
    setRemainingTime(0);
    return true;
  }, [maxRequests, windowMs]);

  return { canExecute, remainingTime, execute };
};