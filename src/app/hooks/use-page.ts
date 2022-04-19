import { useDebugValue, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getPageName } from "@s/router";

export const usePage = () => {
  const location = useLocation();
  const page = useMemo(
    () => getPageName(location.pathname),
    [location.pathname]
  );
  useDebugValue(page);
  return page;
};
