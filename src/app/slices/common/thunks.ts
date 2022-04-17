import type { Dictionary } from "@reduxjs/toolkit";
import { push } from "connected-react-router";
import throttle from "lodash.throttle";
import { is } from "typescript-is";
import { notify } from "~/app/snackbar-queue";
import type { AppThunk } from "~/app/store";
import firestore from "@s/firebase/firestore";
import {
  selectURLEntry as selectURLGuide,
  setURLEntry as setURLGuide,
} from "@s/guides";
import { setHistoryTab } from "@s/history/thunks";
import type { HistoryTab } from "@s/history/types";
import {
  selectDefaultPreset,
  selectLinkedFavorites,
  selectLoading,
  selectURLSet,
  setAppPresets,
  setCurrentPreset,
  setLinkedFavorites,
  setSearch as setMainSearch,
  setSort as setMainSort,
  setSortOrder as setMainSortOrder,
  setTransition,
  setURLSet,
  setURLWhitelist,
  updatePreset,
} from "@s/main";
import {
  allSorts,
  pageSort,
  pageSortOrder,
  sortBlacklist,
  whitelistParams,
} from "@s/main/constants";
import type { whitelistShipped } from "@s/main/constants";
import { getData, setWhitelistMerge } from "@s/main/thunks";
import type { WhitelistType } from "@s/main/types";
import { setStatisticsTab } from "@s/statistics/thunks";
import type { StatsTab } from "@s/statistics/types";
import {
  selectURLEntry as selectURLUpdate,
  setURLEntry as setURLUpdate,
} from "@s/updates";
import { getLinkedFavorites } from "@s/user/thunks";
import { arrayIncludes, camelise, createURL, hasKey } from "@s/util/functions";
import themesMap from "~/_themes.module.scss";
import {
  selectPage,
  setAppPage,
  setDevice,
  setOrientation,
  setThemeMaps,
} from ".";
import { blankTheme, mainPages, pageTitle, urlPages } from "./constants";
import type { Page, ThemeMap } from "./types";

export const triggerTransition =
  (delay = 300): AppThunk<void> =>
  (dispatch) => {
    setTransition(true);
    setTimeout(() => {
      dispatch(setTransition(false));
    }, delay);
  };

export const saveTheme = (): AppThunk<void> => (dispatch) => {
  const interpolatedThemeMap = Object.entries(themesMap).reduce<
    Dictionary<ThemeMap>
  >((prev, [key, val]) => {
    const [theme, prop] = key.split("|");

    const copy = { ...prev };

    copy[theme] ??= blankTheme;

    const value = val === "true" || val === "false" ? val === "true" : val;
    const camelProp = camelise(prop, "-");
    if (hasKey(copy, theme) && hasKey(blankTheme, camelProp)) {
      copy[theme] = { ...copy[theme], [camelProp]: value } as ThemeMap;
    }
    return copy;
  }, {});
  dispatch(setThemeMaps(interpolatedThemeMap));
};

export const checkDevice = (): AppThunk<void> => (dispatch) => {
  let i = 0;
  let lastWidth = Math.max(
    document.documentElement.clientWidth,
    window.innerWidth || 0
  );
  let lastDevice = "tablet";
  let lastOrientation = "landscape";
  const calculate = () => {
    const vw = Math.max(
      document.documentElement.clientWidth,
      window.innerWidth || 0
    );
    if (vw !== lastWidth || i === 0) {
      if (vw >= 1240) {
        if (lastDevice !== "desktop") {
          dispatch(setDevice("desktop"));
          lastDevice = "desktop";
        }
      } else if (vw < 1240 && vw >= 600) {
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
    const orientation = window.matchMedia("(orientation: portrait)").matches
      ? "portrait"
      : "landscape";
    if (lastOrientation !== orientation) {
      dispatch(setOrientation(orientation));
      lastOrientation = orientation;
    }
  };
  calculate();
  window.addEventListener("resize", throttle(calculate, 1000));
};

export const getURLQuery = (): AppThunk<void> => (dispatch, getState) => {
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
          dispatch([
            setAppPage(pageQuery),
            setMainSort(pageSort[pageQuery]),
            setMainSortOrder(pageSortOrder[pageQuery]),
          ]);
        } else {
          const sortQuery = params.get("sort");
          const sortOrderQuery = params.get("sortOrder");
          dispatch([
            setAppPage(pageQuery),
            setMainSort(
              arrayIncludes(allSorts, sortQuery) &&
                !arrayIncludes(sortBlacklist[sortQuery], pageQuery)
                ? sortQuery
                : pageSort[pageQuery]
            ),
            setMainSortOrder(
              sortOrderQuery &&
                (sortOrderQuery === "ascending" ||
                  sortOrderQuery === "descending")
                ? sortOrderQuery
                : pageSortOrder[pageQuery]
            ),
          ]);
        }
      } else {
        dispatch(setAppPage(pageQuery));
      }
    } else {
      dispatch([
        setAppPage("calendar"),
        setMainSort(pageSort.calendar),
        setMainSortOrder(pageSortOrder.calendar),
      ]);
    }
  } else {
    dispatch([
      setAppPage("calendar"),
      setMainSort(pageSort.calendar),
      setMainSortOrder(pageSortOrder.calendar),
    ]);
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
  if (params.has("keysetId")) {
    const keysetId = params.get("keysetId");
    if (keysetId) {
      dispatch(setURLSet("id", keysetId));
    }
  } else if (params.has("keysetAlias")) {
    const keysetAlias = params.get("keysetAlias");
    if (keysetAlias) {
      dispatch(setURLSet("alias", keysetAlias));
    }
  } else if (params.has("keysetName")) {
    const keysetName = params.get("keysetName");
    if (keysetName) {
      dispatch(setURLSet("name", keysetName));
    }
  }
  if (params.has("statisticsTab")) {
    const urlTab = params.get("statisticsTab");
    if (urlTab && is<StatsTab>(urlTab)) {
      dispatch(setStatisticsTab(urlTab));
    }
  }
  if (params.has("historyTab")) {
    const urlTab = params.get("historyTab");
    if (urlTab && is<HistoryTab>(urlTab)) {
      dispatch(setHistoryTab(urlTab));
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

export const setPage =
  (page: Page): AppThunk<void> =>
  (dispatch, getState) => {
    const state = getState();
    const appPage = selectPage(state);
    const loading = selectLoading(state);
    const urlSet = selectURLSet(state);
    const linkedFavorites = selectLinkedFavorites(state);
    const urlGuide = selectURLGuide(state);
    const urlUpdate = selectURLUpdate(state);
    if (page !== appPage && !loading && is<Page>(page)) {
      dispatch(triggerTransition());
      setTimeout(() => {
        dispatch([setMainSearch(""), setAppPage(page)]);
        if (arrayIncludes(mainPages, page)) {
          dispatch([
            setMainSort(pageSort[page]),
            setMainSortOrder(pageSortOrder[page]),
          ]);
        }
        document.documentElement.scrollTop = 0;
      }, 90);
      document.title = `KeycapLendar: ${pageTitle[page]}`;
      if (urlSet.value) {
        dispatch(setURLSet("id", ""));
      }
      if (urlGuide) {
        dispatch(setURLGuide(""));
      }
      if (urlUpdate) {
        dispatch(setURLUpdate(""));
      }
      if (linkedFavorites.array.length > 0) {
        dispatch(setLinkedFavorites({ array: [], displayName: "" }));
      }
      const newUrl = createURL({ pathname: `/${page}` }, (params) => {
        params.delete("page");
        const pageParams = [
          "keysetId",
          "keysetAlias",
          "keysetName",
          "guideId",
          "updateId",
          "favoritesId",
        ];
        pageParams.forEach((param) => {
          if (params.has(param)) {
            params.delete(param);
          }
        });
      });
      dispatch(push(newUrl));
    }
  };
