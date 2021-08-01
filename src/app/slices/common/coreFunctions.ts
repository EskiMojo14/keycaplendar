import { is } from "typescript-is";
import { typedFirestore } from "@s/firebase/firestore";
import store from "~/app/store";
import { queue } from "~/app/snackbarQueue";
import { setAppPage, setDevice } from "./commonSlice";
import { mainPages, urlPages } from "./constants";
import { arrayIncludes } from "./functions";
import { Page } from "./types";
import { setURLEntry as setURLGuide } from "@s/guides/guidesSlice";
import { setHistoryTab } from "@s/history/functions";
import { HistoryTab } from "@s/history/types";
import {
  setSort as setMainSort,
  setSortOrder as setMainSortOrder,
  setAppPresets,
  setURLSet,
  setURLWhitelist,
} from "@s/main/mainSlice";
import { allSorts, pageSort, pageSortOrder, sortBlacklist, whitelistParams, whitelistShipped } from "@s/main/constants";
import { getData, setWhitelistMerge, updatePreset } from "@s/main/functions";
import { WhitelistType } from "@s/main/types";
import { setStatisticsTab } from "@s/statistics/functions";
import { StatsTab } from "@s/statistics/types";
import { setURLEntry as setURLUpdate } from "@s/updates/updatesSlice";
import { getLinkedFavorites } from "@s/user/functions";

const { dispatch } = store;

export const checkDevice = () => {
  let i = 0;
  let lastWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  let lastDevice = "tablet";
  const calculate = () => {
    const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    if (vw !== lastWidth || i === 0) {
      if (vw >= 840) {
        if (lastDevice !== "desktop") {
          dispatch(setDevice("desktop"));
          lastDevice = "desktop";
        }
      } else if (vw < 840 && vw >= 480) {
        if (lastDevice !== "tablet") {
          dispatch(setDevice("tablet"));
          lastDevice = "tablet";
        }
      } else {
        if (lastDevice !== "mobile") {
          dispatch(setDevice("mobile"));
          lastDevice = "mobile";
        }
      }
      lastWidth = vw;
      i++;
    }
  };
  calculate();
  window.addEventListener("resize", calculate);
};

export const getURLQuery = () => {
  const params = new URLSearchParams(window.location.search);
  const path = window.location.pathname.substring(1);
  if (path || params.has("page")) {
    const pageQuery = path || params.get("page");
    if (
      arrayIncludes(urlPages, pageQuery) ||
      (is<Page>(pageQuery) && process.env.NODE_ENV === "development") ||
      (pageQuery === "favorites" && params.has("favoritesId"))
    ) {
      if (arrayIncludes(mainPages, pageQuery)) {
        if (pageQuery === "calendar") {
          dispatch(setAppPage(pageQuery));
          dispatch(setMainSort(pageSort[pageQuery]));
          dispatch(setMainSortOrder(pageSortOrder[pageQuery]));
        } else {
          const sortQuery = params.get("sort");
          const sortOrderQuery = params.get("sortOrder");
          dispatch(setAppPage(pageQuery));
          dispatch(
            setMainSort(
              arrayIncludes(allSorts, sortQuery) && !arrayIncludes(sortBlacklist[sortQuery], pageQuery)
                ? sortQuery
                : pageSort[pageQuery]
            )
          );
          dispatch(
            setMainSortOrder(
              sortOrderQuery && (sortOrderQuery === "ascending" || sortOrderQuery === "descending")
                ? sortOrderQuery
                : pageSortOrder[pageQuery]
            )
          );
        }
      } else {
        dispatch(setAppPage(pageQuery));
      }
    } else {
      dispatch(setAppPage("calendar"));
    }
  } else {
    dispatch(setAppPage("calendar"));
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
        } else if (param === "profiles" || param === "shipped" || param === "vendors" || param === "regions") {
          const array = val.split(" ").map((item) => item.replace("-", " "));
          if (param === "shipped") {
            if (is<typeof whitelistShipped[number][]>(array)) {
              whitelistObj[param] = array;
            }
          } else {
            whitelistObj[param] = array;
          }
        } else if (param === "vendorMode" && (val === "include" || val === "exclude")) {
          whitelistObj[param] = val;
        }
      }
    }
    if (index === array.length - 1) {
      dispatch(setURLWhitelist(whitelistObj));
      setWhitelistMerge(whitelistObj, false);
    }
  });
  if (params.has("keysetId")) {
    const keysetId = params.get("keysetId");
    if (keysetId) {
      dispatch(
        setURLSet({
          prop: "id",
          value: keysetId,
        })
      );
    }
  } else if (params.has("keysetAlias")) {
    const keysetAlias = params.get("keysetAlias");
    if (keysetAlias) {
      dispatch(
        setURLSet({
          prop: "alias",
          value: keysetAlias,
        })
      );
    }
  } else if (params.has("keysetName")) {
    const keysetName = params.get("keysetName");
    if (keysetName) {
      dispatch(
        setURLSet({
          prop: "name",
          value: keysetName,
        })
      );
    }
  }
  if (params.has("statisticsTab")) {
    const urlTab = params.get("statisticsTab");
    if (urlTab && is<StatsTab>(urlTab)) {
      setStatisticsTab(urlTab);
    }
  }
  if (params.has("historyTab")) {
    const urlTab = params.get("historyTab");
    if (urlTab && is<HistoryTab>(urlTab)) {
      setHistoryTab(urlTab);
    }
  }
  if (params.has("guideId")) {
    const guideId = params.get("guideId");
    if (guideId) {
      dispatch(setURLGuide(guideId));
    }
  }
  if (params.has("updateId")) {
    const updateId = params.get("updateId");
    if (updateId) {
      dispatch(setURLUpdate(updateId));
    }
  }
  if (params.has("favoritesId")) {
    const favoritesId = params.get("favoritesId");
    if (favoritesId) {
      getLinkedFavorites(favoritesId);
    }
  }
  getData();
};

export const getGlobals = () => {
  typedFirestore
    .collection("app")
    .doc("globals")
    .get()
    .then((doc) => {
      const data = doc.data();
      if (data) {
        const { filterPresets } = data;
        if (filterPresets) {
          const updatedPresets = filterPresets.map((preset) => updatePreset(preset));
          dispatch(setAppPresets(updatedPresets));
        }
      }
    })
    .catch((error) => {
      console.log("Failed to get global settings: " + error);
      queue.notify({ title: "Failed to get global settings: " + error });
    });
};
