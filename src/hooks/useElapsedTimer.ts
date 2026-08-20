import { useEffect, useState } from 'react';

interface IUseElapsedTimerResult {
  elapsedSeconds: number;
  isActive: boolean;
  start: () => void;
  reset: () => void;
}

/** Tracks whole seconds elapsed while active, ticking once per second. */
export function useElapsedTimer(): IUseElapsedTimerResult {
  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!isActive) {
      return;
    }

    const intervalId = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isActive]);

  function start() {
    setElapsedSeconds(0);
    setIsActive(true);
  }

  function reset() {
    setIsActive(false);
    setElapsedSeconds(0);
  }

  return { elapsedSeconds, isActive, start, reset };
}
