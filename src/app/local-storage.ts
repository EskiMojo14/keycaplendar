import type { RootState } from "~/app/store";
import { initialState as common } from "@s/common";
import type { CommonState } from "@s/common";
import { initialState as main } from "@s/main";
import type { MainState } from "@s/main";
import { selectCookies } from "@s/settings";

export const hydrateState = (state: any) => {
  const hydrateCommonSlice = (
    partialCommon: Partial<CommonState>
  ): CommonState => ({
    ...common,
    ...partialCommon,
  });
  const hydrateMainSlice = (partialMain: Partial<MainState>): MainState => ({
    ...main,
    ...partialMain,
  });
  return {
    ...state,
    common: hydrateCommonSlice(state.common),
    main: hydrateMainSlice(state.main),
  };
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

export const sanitiseState = (
  state: RootState
): Partial<{
  [key in keyof RootState]: Partial<RootState[key]>;
}> => {
  const { common, main, settings, user } = state;
  const sanitiseCommonSlice = (
    commonSlice: CommonState
  ): Partial<CommonState> => {
    const { theme, themeMaps } = commonSlice;
    return { theme, themeMaps };
  };
  const sanitiseMainSlice = (mainSlice: MainState): Partial<MainState> => {
    const {
      allDesigners,
      allProfiles,
      allRegions,
      allVendorRegions,
      allVendors,
      appPresets,
      currentPreset,
      defaultPreset,
      sort,
      sortOrder,
      whitelist,
    } = mainSlice;
    return {
      allDesigners,
      allProfiles,
      allRegions,
      allVendorRegions,
      allVendors,
      appPresets,
      currentPreset,
      defaultPreset,
      sort,
      sortOrder,
      whitelist,
    };
  };
  return {
    common: sanitiseCommonSlice(common),
    main: sanitiseMainSlice(main),
    settings,
    user,
  };
};

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
