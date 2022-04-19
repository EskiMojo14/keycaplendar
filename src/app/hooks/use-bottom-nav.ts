import { useDebugValue } from "react";
import { useAppSelector } from "@h";
import useDevice from "@h/use-device";
import { selectBottomNav } from "@s/settings";

export const useBottomNav = () => {
  const device = useDevice();
  const allowBottomNav = useAppSelector(
    (state) => device === "mobile" && selectBottomNav(state)
  );
  useDebugValue(allowBottomNav);
  return allowBottomNav;
};

export default useBottomNav;
