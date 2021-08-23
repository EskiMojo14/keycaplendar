import { RootState } from "~/app/store";
import { initialState as main, MainState } from "@s/main";
import { selectCookies } from "@s/settings";

export const hydrateState = (state: any) => {
  const hydrateMainSlice = (partialMain: Partial<MainState>): MainState => ({
    ...main,
    ...partialMain,
  });
  return { ...state, main: hydrateMainSlice(state.main) };
};

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

export const sanitiseState = (state: RootState) => {
  const { main, settings, user } = state;
  const sanitiseMainSlice = (mainSlice: MainState) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { transition, loading, urlSet, search, urlWhitelist, linkedFavorites, ...filteredMainSlice } = mainSlice;
    return filteredMainSlice;
  };
  return {
    main: sanitiseMainSlice(main),
    settings,
    user,
  };
};

export const saveState = (state: RootState) => {
  try {
    const serializedState = JSON.stringify(sanitiseState(state));
    const accepted = selectCookies(state);
    if (accepted) {
      localStorage.setItem("state", serializedState);
    }
  } catch (err) {
    throw new Error("Can't save changes in local storage");
  }
};
