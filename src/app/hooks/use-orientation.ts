import { useDebugValue, useEffect, useState } from "react";

export type OrientationState = {
  angle: number;
  type:
    | ""
    | "landscape-primary"
    | "landscape-secondary"
    | "portrait-primary"
    | "portrait-secondary";
};

const defaultState: OrientationState = {
  angle: 0,
  type: "landscape-primary",
};

const useOrientation = (initialState: OrientationState = defaultState) => {
  const [state, setState] = useState(initialState);
  useDebugValue(state);

  useEffect(() => {
    let mounted = true;

    const onChange = () => {
      if (mounted) {
        const { orientation } = screen as any;

        if (orientation) {
          const { angle, type } = orientation;
          setState({ angle, type });
        } else if (window.orientation !== undefined) {
          setState({
            angle:
              typeof window.orientation === "number" ? window.orientation : 0,
            type: "",
          });
        } else {
          setState(initialState);
        }
      }
    };
    window.screen.orientation.addEventListener("change", onChange);
    onChange();
    return () => {
      mounted = false;
      window.screen.orientation.removeEventListener("change", onChange);
    };
  }, []);

  return state;
};

export default useOrientation;
