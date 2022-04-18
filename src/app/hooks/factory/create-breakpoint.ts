import { useDebugValue, useEffect, useMemo, useState } from "react";
import { camelise } from "@s/util/functions";

// mostly taken from react-use
const createBreakpoint = <
  Breakpoints extends Record<string, number> = {
    laptop: number;
    laptopL: number;
    tablet: number;
  }
>(
  breakpoints: Breakpoints = {
    laptop: 1024,
    laptopL: 1440,
    tablet: 768,
  } as unknown as Breakpoints,
  name = "breakpoint"
) => {
  const sortedBreakpoints = Object.entries(breakpoints).sort((a, b) =>
    a[1] >= b[1] ? 1 : -1
  );
  function hook(): keyof Breakpoints {
    const [screen, setScreen] = useState(window.innerWidth);

    useEffect(() => {
      const setSideScreen = (): void => {
        setScreen(window.innerWidth);
      };
      setSideScreen();
      window.addEventListener("resize", setSideScreen);
      return () => {
        window.removeEventListener("resize", setSideScreen);
      };
    });
    const result = useMemo(
      () =>
        sortedBreakpoints.reduce((acc, [name, width]) => {
          if (screen >= width) {
            return name;
          } else {
            return acc;
          }
        }, sortedBreakpoints[0][0]),
      [screen]
    );
    useDebugValue(result);
    return result;
  }
  return Object.defineProperty(hook, "name", {
    value: camelise(`use ${name}`),
  });
};

export default createBreakpoint;
