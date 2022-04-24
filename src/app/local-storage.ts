import type { AnyAction } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import type { History } from "history";
import produce from "immer";
import pick from "lodash.pick";
import type { RootState } from "~/app/store";
import type { AppStartListening } from "@mw/listener";
import { initialState as common } from "@s/common";
import { initialState as main } from "@s/main";
import {
  allSorts,
  sortBlacklist,
  whitelistParams,
  whitelistShipped,
} from "@s/main/constants";
import { getPageName } from "@s/router";
import { mainPages } from "@s/router/constants";
import { selectCookies, initialState as settings } from "@s/settings";
import { initialState as user } from "@s/user";
import {
  arrayIncludes,
  createURL,
  objectEntries,
  objectFromEntries,
} from "@s/util/functions";
import type { ObjectEntries } from "@s/util/types";

type WhitelistDef = {
  [K in keyof RootState]?:
    | true
    | [keyof RootState[K], ...(keyof RootState[K])[]];
};

type WhitelistedState<Whitelist extends WhitelistDef> = {
  [Key in keyof RootState as Key extends keyof Whitelist
    ? Key
    : never]: Whitelist[Key] extends (keyof RootState[Key])[]
    ? Pick<RootState[Key], Whitelist[Key][number]>
    : RootState[Key];
};

/** Make sure that initial state is provided if only part of the state is whitelisted */
type InitialStates<Whitelist extends WhitelistDef> = {
  [Key in keyof RootState as Whitelist[Key] extends
    | (keyof RootState[Key])[]
    | true
    ? Key
    : never]: RootState[Key];
};

const idWhitelist = <W extends WhitelistDef>(whitelist: W) => whitelist;

const persistWhitelist = idWhitelist({
  common: ["systemTheme"],
  main: ["presets", "sorts", "whitelist"],
  settings: true,
  user: true,
});

type PersistWhitelist = typeof persistWhitelist;

const initialStates: InitialStates<PersistWhitelist> = {
  common,
  main,
  settings,
  user,
};

export const hydrateState = (
  state: WhitelistedState<PersistWhitelist>
): InitialStates<PersistWhitelist> =>
  objectFromEntries(
    objectEntries(persistWhitelist).map(([key, whitelist]) => [
      key,
      (Array.isArray(whitelist)
        ? { ...initialStates[key], ...state[key] }
        : state[key]) as RootState[typeof key],
    ]) as ObjectEntries<{ [Key in keyof PersistWhitelist]: RootState[Key] }>
  );

const paramsToClear = ["sort", "sortOrder", ...whitelistParams];

export const modifyStateForParams = (
  state = initialStates,
  history: History
) => {
  const page = getPageName(history.location.pathname);
  const params = new URLSearchParams(history.location.search);

  if (paramsToClear.some((param) => params.has(param))) {
    const newUrl = createURL(
      {},
      (params) => {
        paramsToClear.forEach((param) => params.delete(param));
      },
      true
    );
    history.replace(newUrl);
  }

  return produce(state, (draftState) => {
    if (arrayIncludes(mainPages, page)) {
      const sortQuery = params.get("sort");
      const sortOrderQuery = params.get("sortOrder");
      if (
        sortQuery &&
        arrayIncludes(allSorts, sortQuery) &&
        !sortBlacklist[sortQuery].includes(page)
      ) {
        draftState.main.sorts[page].sort = sortQuery;
      }
      if (
        sortOrderQuery &&
        (sortOrderQuery === "ascending" || sortOrderQuery === "descending")
      ) {
        draftState.main.sorts[page].sortOrder = sortOrderQuery;
      }

      whitelistParams.forEach((param) => {
        if (params.has(param)) {
          const val = params.get(param);
          if (val) {
            if (
              param === "profile" ||
              param === "region" ||
              param === "vendor"
            ) {
              const plural = `${param}s`;
              const plurals = ["profiles", "regions", "vendors"] as const;
              if (arrayIncludes(plurals, plural)) {
                state.main.whitelist[plural] = [val.replace(/-/, " ")];
              }
            } else if (
              param === "profiles" ||
              param === "shipped" ||
              param === "vendors" ||
              param === "regions"
            ) {
              const array = val
                .split(" ")
                .map((item) => item.replace(/-/, " "));
              if (param === "shipped") {
                if (
                  array.every(
                    (string): string is typeof whitelistShipped[number] =>
                      arrayIncludes(whitelistShipped, string)
                  )
                ) {
                  state.main.whitelist[param] = array;
                }
              } else {
                state.main.whitelist[param] = array;
              }
            } else if (
              param === "vendorMode" &&
              (val === "include" || val === "exclude")
            ) {
              state.main.whitelist[param] = val;
            }
          }
        }
      });
    }
  });
};

export const loadState = (history: History) => {
  try {
    const serializedState = localStorage.getItem("state");
    if (serializedState === null) {
      return modifyStateForParams(undefined, history);
    }
    const hydratedState = hydrateState(JSON.parse(serializedState));
    return modifyStateForParams(hydratedState, history);
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

export const sanitiseState = (state: RootState) =>
  objectFromEntries(
    objectEntries(persistWhitelist).map(([key, whitelist]) => [
      key,
      Array.isArray(whitelist) ? pick(state[key], ...whitelist) : state[key],
    ]) as ObjectEntries<WhitelistedState<PersistWhitelist>>
  );

export const saveState = (state: RootState) => {
  try {
    const accepted = selectCookies(state);
    if (accepted) {
      const serializedState = JSON.stringify(sanitiseState(state));
      localStorage.setItem("state", serializedState);
    }
  } catch (err) {
    console.error(err);
    throw new Error("Can't save changes in local storage");
  }
};

/**
 * Creates a selector that checks the current state and old state for a specified key,
 * (or a specified key's specified keys if `whitelist` is an array)
 * and returns whether everything we care about is the same
 */
const createSubStateComparator = <K extends keyof PersistWhitelist>([
  key,
  whitelist,
]: [K, PersistWhitelist[K]]) =>
  createSelector(
    (_: AnyAction, currentState: RootState) => currentState[key],
    (_: unknown, __: unknown, oldState: RootState) => oldState[key],
    (current, old) =>
      current === old || // if we've reached this point, something inside must have changed
      (Array.isArray(whitelist) && // if whitelist was `true`, we've already returned `false` because we only care about if *something* changed
        // now we check whether any of the bits we care about have changed
        /* @ts-expect-error typescript doesn't like that the tuples don't intersect, and i don't want to have to prove that the keys work, we've already checked that when making the whitelist */
        whitelist.every((subKey) => current[subKey] === old[subKey]))
  );

/**
 * Turn each of our whitelist entries into a selector, then check whether they all return true (i.e nothing has changed)
 */

const predicate = createSelector(
  ...objectEntries(persistWhitelist).map(createSubStateComparator),
  (...allEquals: boolean[]) => !allEquals.every(Boolean)
);

export const setupPersistListener = (startListening: AppStartListening) =>
  startListening({
    effect: async (action, { cancelActiveListeners, delay, getState }) => {
      // debounce
      cancelActiveListeners();
      await delay(1000);

      saveState(getState());
    },
    predicate,
  });
