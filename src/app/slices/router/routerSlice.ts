import { createBrowserHistory, LocationState } from "history";
import { connectRouter, RouterState } from "connected-react-router";
import { Reducer } from "@reduxjs/toolkit";
import { RootState } from "~/app/store";
import { allPages } from "@s/common/constants";
import { arrayIncludes } from "@s/common/functions";
import { Page } from "@s/common/types";

export const history = createBrowserHistory();

export const reducer = (connectRouter(history) as any) as Reducer<RouterState<LocationState>>;

export const selectPathname = (state: RootState) => state.router.location.pathname;

export const selectPage = (state: RootState): Page => {
  const pathname = state.router.location.pathname.slice(1);
  return arrayIncludes(allPages, pathname) ? pathname : "404";
};

export const selectSearch = (state: RootState) => state.router.location.search;

export default reducer;
