import { RootState } from "~/app/store";
import { initialState as audit } from "@s/audit";
import { initialState as common } from "@s/common";
import { initialState as guides } from "@s/guides";
import { initialState as history } from "@s/history";
import { initialState as images } from "@s/images";
import { initialState as main } from "@s/main";
import { initialState as settings } from "@s/settings";
import { initialState as statistics } from "@s/statistics";
import { initialState as updates } from "@s/updates";
import { initialState as user } from "@s/user";
import { initialState as users } from "@s/users";

export const storeInitialState = {
  audit,
  common,
  guides,
  history,
  images,
  main,
  settings,
  statistics,
  updates,
  user,
  users,
};

export const hydrateState = (state: any) => {
  return { ...storeInitialState, ...state };
};

export const loadState = () => {
  try {
    const serializedState = localStorage.getItem("state");
    if (serializedState === null) {
      return undefined;
    }
    return hydrateState(JSON.parse(serializedState));
  } catch (err) {
    return undefined;
  }
};

export const sanitiseState = (state: RootState) => {
  const { main, settings, user } = state;
  return {
    main,
    settings,
    user,
  };
};

export const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify(sanitiseState(state));
    localStorage.setItem("state", serializedState);
  } catch (err) {
    throw new Error("Can't save changes in local storage");
  }
};
