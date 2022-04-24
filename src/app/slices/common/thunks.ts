import { is } from "typescript-is";
import { history } from "~/app/history";
import { notify } from "~/app/snackbar-queue";
import type { AppThunk } from "~/app/store";
import firestore from "@s/firebase/firestore";
import {
  selectDefaultPreset,
  setAppPresets,
  setCurrentPreset,
  setSort as setMainSort,
  setSortOrder as setMainSortOrder,
  setTransition,
  setURLWhitelist,
  updatePreset,
} from "@s/main";
import { allSorts, sortBlacklist, whitelistParams } from "@s/main/constants";
import type { whitelistShipped } from "@s/main/constants";
import { getData, setWhitelistMerge } from "@s/main/thunks";
import type { WhitelistType } from "@s/main/types";
import { getPageName } from "@s/router";
import { getLinkedFavorites } from "@s/user/thunks";
import { arrayIncludes } from "@s/util/functions";
import { mainPages, urlPages } from "./constants";
import type { Page } from "./types";

export const triggerTransition =
  (delay = 300): AppThunk<void> =>
  (dispatch) => {
    setTransition(true);
    setTimeout(() => {
      dispatch(setTransition(false));
    }, delay);
  };

export const getURLQuery = (): AppThunk<void> => (dispatch, getState) => {
  const params = new URLSearchParams(window.location.search);
  const path = getPageName(history.location.pathname);
  if (path) {
    const pageQuery = path || params.get("page");
    if (
      arrayIncludes(urlPages, pageQuery) ||
      (is<Page>(pageQuery) && process.env.NODE_ENV === "development") ||
      (pageQuery === "favorites" && params.has("favoritesId"))
    ) {
      if (arrayIncludes(mainPages, pageQuery)) {
        const sortQuery = params.get("sort");
        const sortOrderQuery = params.get("sortOrder");
        if (
          sortQuery &&
          arrayIncludes(allSorts, sortQuery) &&
          !arrayIncludes(sortBlacklist[sortQuery], pageQuery)
        ) {
          dispatch(setMainSort(pageQuery, sortQuery));
        }
        if (
          sortOrderQuery &&
          (sortOrderQuery === "ascending" || sortOrderQuery === "descending")
        ) {
          dispatch(setMainSortOrder(pageQuery, sortOrderQuery));
        }
      }
    }
  }
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
      const defaultPreset = selectDefaultPreset(getState());
      dispatch([setURLWhitelist(whitelistObj), setCurrentPreset("default")]);
      dispatch(
        setWhitelistMerge(
          { ...defaultPreset.whitelist, ...whitelistObj },
          false
        )
      );
    }
  });
  if (params.has("favoritesId")) {
    const favoritesId = params.get("favoritesId");
    if (favoritesId) {
      dispatch(getLinkedFavorites(favoritesId));
    }
  }
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
