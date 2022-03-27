import pick from "lodash.pick";
import type { RootState } from "~/app/store";
import { initialState as common } from "@s/common";
import { initialState as main } from "@s/main";
import { selectCookies } from "@s/settings";
import { hasKey, objectEntries, objectFromEntries } from "@s/util/functions";
import type { ObjectEntries } from "@s/util/types";
import type { AppStartListening } from "~/app/middleware/listener";

const initialStates: Partial<RootState> = { common, main };

const idPersistWhitelist = <
  Whitelist extends {
    [K in keyof RootState]?:
      | true
      | [keyof RootState[K], ...(keyof RootState[K])[]];
  }
>(
  whitelist: Whitelist
) => whitelist;

const persistWhitelist = idPersistWhitelist({
  common: ["theme", "themeMaps"],
  main: [
    "allDesigners",
    "allProfiles",
    "allRegions",
    "allVendorRegions",
    "allVendors",
    "presets",
    "sort",
    "sortOrder",
    "whitelist",
  ],
  settings: true,
  user: true,
});

type PersistWhitelist = typeof persistWhitelist;

type WhitelistedState = {
  [Key in keyof PersistWhitelist]: PersistWhitelist[Key] extends (keyof RootState[Key])[]
    ? Pick<RootState[Key], PersistWhitelist[Key][number]>
    : RootState[Key];
};

export const hydrateState = (state: WhitelistedState) =>
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
    ]) as ObjectEntries<{ [Key in keyof RootState]?: Partial<RootState[Key]> }>
  );

export const saveState = (state: RootState) => {
  try {
    const accepted = selectCookies(state);
    if (accepted) {
      const serializedState = JSON.stringify(sanitiseState(state));
      localStorage.setItem("state", serializedState);
    }
  } catch (err) {
    throw new Error("Can't save changes in local storage");
  }
};

export const setupPersistListener = (startListening: AppStartListening) =>
  startListening({
    effect: async (action, { cancelActiveListeners, delay, getState }) => {
      // debounce
      cancelActiveListeners();
      await delay(1000);

      saveState(getState());
    },
    predicate: (action, currentState, originalState) =>
      objectEntries(persistWhitelist).some(([key, whitelist]) =>
        Array.isArray(whitelist)
          ? whitelist.some(
              (innerKey) =>
                hasKey(currentState[key], innerKey) &&
                currentState[key][innerKey] !== originalState[key][innerKey]
            )
          : currentState[key] !== originalState[key]
      ),
  });
