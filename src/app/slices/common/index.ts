import { createSelector, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import produce from "immer";
import type { RootState } from "~/app/store";
import { combineListeners } from "@mw/listener/functions";
import baseApi from "@s/api";
import { createErrorMessagesListeners } from "@s/api/functions";
import firestore from "@s/firebase/firestore";
import type { GlobalDoc } from "@s/firebase/types";
// eslint-disable-next-line import/no-cycle
import { selectAllRegions } from "@s/main";
import { updatePreset } from "@s/main/functions";
import {
  selectApplyTheme,
  selectDarkTheme,
  selectLichTheme,
  selectLightTheme,
  selectManualTheme,
} from "@s/settings";

export const commonApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getGlobals: build.query<GlobalDoc, void>({
      queryFn: async (_, { getState }) => {
        try {
          const doc = await firestore.collection("app").doc("globals").get();
          const data = doc.data();
          if (data === undefined) {
            throw new Error("Data returned undefined");
          }
          const regions = selectAllRegions(getState() as RootState);
          return {
            data: produce(data, (draftData) => {
              draftData.filterPresets = draftData.filterPresets.map((preset) =>
                updatePreset(preset, { regions })
              );
            }),
          };
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetGlobalsQuery } = commonApi;

export const setupCommonListeners = combineListeners((startListening) => [
  ...createErrorMessagesListeners(
    commonApi.endpoints,
    { getGlobals: "Failed to get global settings" },
    startListening
  ),
]);

export type CommonState = {
  systemTheme: "dark" | "light";
  timed: "dark" | "light";
};

export const initialState: CommonState = {
  systemTheme: "light",
  timed: "light",
};

export const commonSlice = createSlice({
  initialState,
  name: "common",
  reducers: {
    setSystemTheme: (state, { payload }: PayloadAction<boolean>) => {
      state.systemTheme = payload ? "dark" : "light";
    },
    setTimed: (state, { payload }: PayloadAction<boolean>) => {
      state.timed = payload ? "dark" : "light";
    },
  },
});

export const {
  actions: { setSystemTheme, setTimed },
} = commonSlice;

export const selectSystemTheme = (state: RootState) => state.common.systemTheme;

export const selectTimed = (state: RootState) => state.common.timed;

export const selectTheme = createSelector(
  selectApplyTheme,
  selectManualTheme,
  selectTimed,
  selectSystemTheme,
  selectLichTheme,
  selectLightTheme,
  selectDarkTheme,
  (
    applyTheme,
    manualTheme,
    timedDark,
    systemTheme,
    lichTheme,
    lightTheme,
    darkTheme
  ) => {
    if (lichTheme) {
      return "lich";
    }
    switch (applyTheme) {
      case "manual": {
        return manualTheme === "dark" ? darkTheme : lightTheme;
      }
      case "system": {
        return systemTheme === "dark" ? darkTheme : lightTheme;
      }
      case "timed": {
        return timedDark === "dark" ? darkTheme : lightTheme;
      }
      default: {
        return lightTheme;
      }
    }
  }
);

export default commonSlice.reducer;
