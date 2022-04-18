import { useDebugValue } from "react";
import type { Location } from "history";
import { useLocation } from "react-router-dom";
import type { RootState } from "~/app/store";
import { useAppSelector } from "@h";

export const useLocatedSelector = <Selected>(
  selector: (state: RootState, location: Location) => Selected
) => {
  const location = useLocation();
  const selected = useAppSelector((state) => selector(state, location));
  useDebugValue(selected);
  return selected;
};

export default useLocatedSelector;
