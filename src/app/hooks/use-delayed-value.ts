import { useDebugValue, useEffect, useState } from "react";

export const useDelayedValue = <T>(
  value: T,
  delay: number,
  { delayed, instant }: { delayed?: T[]; instant?: T[] } = {}
) => {
  const [delayedValue, setDelayedValue] = useState(value);
  useEffect(() => {
    if (instant?.includes(value) || (delayed && !delayed.includes(value))) {
      setDelayedValue(value);
    } else {
      const id = setTimeout(setDelayedValue, delay, value);
      return () => clearTimeout(id);
    }
  }, [value]);
  useDebugValue(delayedValue);
  return delayedValue;
};

export default useDelayedValue;
