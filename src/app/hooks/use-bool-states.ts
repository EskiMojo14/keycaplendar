import { useCallback, useDebugValue } from "react";

/**
 * Takes a function and returns two callbacks, calling it with boolean parameters.
 * @param func A function to be called with boolean parameters. Typically a `useState` set function.
 * @returns An tuple of callbacks, the first being `func(false)` and the second being `func(true)`.
 */

export const useBoolStates = <T>(
  func: (bool: boolean) => T,
  name?: string
): [setFalse: () => T, setTrue: () => T] => {
  useDebugValue(name ?? func.name);
  return [
    useCallback(() => func(false), [func]),
    useCallback(() => func(true), [func]),
  ];
};

export default useBoolStates;
