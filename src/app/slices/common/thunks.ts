import { is } from "typescript-is";
import { notify } from "~/app/snackbar-queue";
import type { AppThunk } from "~/app/store";
import firestore from "@s/firebase/firestore";
import {
  setAppPresets,
  setCurrentPreset,
  setTransition,
  updatePreset,
} from "@s/main";
import { whitelistParams } from "@s/main/constants";
import type { whitelistShipped } from "@s/main/constants";
import { getData, setWhitelistMerge } from "@s/main/thunks";
import type { WhitelistType } from "@s/main/types";
import { arrayIncludes } from "@s/util/functions";

export const triggerTransition =
  (delay = 300): AppThunk<void> =>
  (dispatch) => {
    setTransition(true);
    setTimeout(() => {
      dispatch(setTransition(false));
    }, delay);
  };

export const getURLQuery = (): AppThunk<void> => (dispatch) => {
  const params = new URLSearchParams(window.location.search);
  const whitelistObj: Partial<WhitelistType> = {};
  whitelistParams.forEach((param, index, array) => {
    if (params.has(param)) {
      const val = params.get(param);
      if (val) {
        if (param === "profile" || param === "region" || param === "vendor") {
          const plural = `${param}s`;
          const plurals = ["profiles", "regions", "vendors"] as const;
          if (arrayIncludes(plurals, plural)) {
            whitelistObj[plural] = [val.replace("-", " ")];
          }
        } else if (
          param === "profiles" ||
          param === "shipped" ||
          param === "vendors" ||
          param === "regions"
        ) {
          const array = val.split(" ").map((item) => item.replace("-", " "));
          if (param === "shipped") {
            if (is<typeof whitelistShipped[number][]>(array)) {
              whitelistObj[param] = array;
            }
          } else {
            whitelistObj[param] = array;
          }
        } else if (
          param === "vendorMode" &&
          (val === "include" || val === "exclude")
        ) {
          whitelistObj[param] = val;
        }
      }
    }
    if (index === array.length - 1 && Object.keys(whitelistObj).length > 0) {
      dispatch([setCurrentPreset("default"), setWhitelistMerge(whitelistObj)]);
    }
  });
  dispatch(getData());
};

export const getGlobals = (): AppThunk<Promise<void>> => async (dispatch) => {
  try {
    const doc = await firestore.collection("app").doc("globals").get();
    const data = doc.data();
    if (data) {
      const { filterPresets } = data;
      if (filterPresets) {
        const updatedPresets = filterPresets.map((preset) =>
          dispatch(updatePreset(preset))
        );
        dispatch(setAppPresets(updatedPresets));
      }
    }
  } catch (error) {
    console.log(`Failed to get global settings: ${error}`);
    notify({ title: `Failed to get global settings: ${error}` });
  }
};
