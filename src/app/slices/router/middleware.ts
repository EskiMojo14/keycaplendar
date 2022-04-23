import type { Middleware } from "@reduxjs/toolkit";
import type { History } from "history";
import { actionCreators, navigationMatcher } from "@s/router";
import { objectEntries } from "@s/util/functions";

export const createRouterMiddleware =
  (history: History): Middleware =>
  (store) =>
  (next) =>
  (action) => {
    if (navigationMatcher(action)) {
      for (const [key, actionCreator] of objectEntries(actionCreators)) {
        if (actionCreator.match(action)) {
          // @ts-expect-error heh
          return history[key](...action.payload);
        }
      }
    }
    return next(action);
  };
