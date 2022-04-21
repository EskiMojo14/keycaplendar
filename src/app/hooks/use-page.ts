import { useDebugValue, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { getPageName, getPageTitle } from "@s/router";

export const usePage = () => {
  const location = useLocation();
  const page = useMemo(
    () => getPageName(location.pathname),
    [location.pathname]
  );
  useDebugValue(page);
  return page;
};

export const usePageTitle = () => {
  const location = useLocation();
  const pageTitle = useMemo(
    () => getPageTitle(location.pathname),
    [location.pathname]
  );
  useDebugValue(pageTitle);
  return pageTitle;
};

export default usePage;
