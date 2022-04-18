import type { AnyAction } from "@reduxjs/toolkit";
import { createSelector } from "@reduxjs/toolkit";
import pick from "lodash.pick";
import type { RootState } from "~/app/store";
import { initialState as common } from "@s/common";
import { initialState as main } from "@s/main";
import { selectCookies } from "@s/settings";
import { objectEntries, objectFromEntries } from "@s/util/functions";
import type { ObjectEntries } from "@s/util/types";
import type { AppStartListening } from "~/app/middleware/listener";

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
  [Key in keyof RootState as Whitelist[Key] extends (keyof RootState[Key])[]
    ? Key
    : never]: RootState[Key];
} & {
  [Key in keyof RootState as Whitelist[Key] extends true
    ? Key
    : Whitelist[Key] extends (keyof RootState[Key])[]
    ? never
    : Key]?: RootState[Key];
};

const idWhitelist = <W extends WhitelistDef>(whitelist: W) => whitelist;

const persistWhitelist = idWhitelist({
  common: ["systemTheme", "themeMaps"],
  main: ["presets", "sort", "sortOrder", "whitelist"],
  settings: true,
  user: true,
});

type PersistWhitelist = typeof persistWhitelist;

const initialStates: InitialStates<PersistWhitelist> = { common, main };

export const hydrateState = (state: WhitelistedState<PersistWhitelist>) =>
  objectFromEntries(
    objectEntries(persistWhitelist).map(([key, whitelist]) => [
      key,
      (Array.isArray(whitelist)
        ? { ...initialStates[key], ...state[key] }
        : state[key]) as RootState[typeof key],
    ]) as ObjectEntries<{ [Key in keyof PersistWhitelist]: RootState[Key] }>
  );

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem("state");
    if (serializedState === null) {
      return undefined;
    }
    return hydrateState(JSON.parse(serializedState));
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
