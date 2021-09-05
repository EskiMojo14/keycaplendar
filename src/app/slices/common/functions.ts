import { is } from "typescript-is";
import debounce from "lodash.debounce";
import { alpha } from "@material-ui/core/styles";
import { typedFirestore } from "@s/firebase/firestore";
import store from "~/app/store";
import { queue } from "~/app/snackbar-queue";
import { setAppPage, setDevice, setGraphColors, setOrientation, setThemeMaps } from ".";
import { blankTheme, mainPages, pageTitle, urlPages } from "./constants";
import { Page, ThemeMap } from "./types";
import { setURLEntry as setURLGuide } from "@s/guides";
import { setHistoryTab } from "@s/history/functions";
import { HistoryTab } from "@s/history/types";
import {
  setSort as setMainSort,
  setSortOrder as setMainSortOrder,
  setSearch as setMainSearch,
  setAppPresets,
  setTransition,
  setURLSet,
  setLinkedFavorites,
  setURLWhitelist,
  selectDefaultPreset,
  setCurrentPreset,
} from "@s/main";
import { allSorts, pageSort, pageSortOrder, sortBlacklist, whitelistParams, whitelistShipped } from "@s/main/constants";
import { filterData, getData, setWhitelistMerge, updatePreset } from "@s/main/functions";
import { WhitelistType } from "@s/main/types";
import { setStatisticsTab } from "@s/statistics/functions";
import { StatsTab } from "@s/statistics/types";
import { setURLEntry as setURLUpdate } from "@s/updates";
import { getLinkedFavorites } from "@s/user/functions";
import { arrayIncludes, camelise, hasKey } from "@s/util/functions";
import themesMap from "~/_themes.module.scss";
import graphMap from "~/_graph-colors.module.scss";

const { dispatch } = store;

/** Gets according text colour for given theme background colour.
 * @param bgColor Theme colour to put text on
 * @param themeMap Theme map to check against.
 * @param [defaultColor=themeMap.textHigh] Default text colour to use if no match found.
 * @returns Theme colour to use for text
 */

export const getTextColour = (bgColor: string, themeMap: ThemeMap, defaultColor = themeMap.textHigh) => {
  switch (bgColor) {
    case themeMap.primary:
      return themeMap.onPrimary;
    case themeMap.primaryLight:
      return themeMap.onPrimaryLight;
    case themeMap.primaryDark:
      return themeMap.onPrimaryDark;
    case themeMap.secondary:
      return themeMap.onSecondary;
    case themeMap.secondaryLight:
      return themeMap.onSecondaryLight;
    case themeMap.secondaryDark:
      return themeMap.onSecondaryDark;
    case themeMap.error:
      return themeMap.onError;
    case themeMap.surface:
      return themeMap.onSurface;
    default:
      return defaultColor;
  }
};

/**
 * Gets text opacity for specified emphasis.
 * @param emphasis Emphasis to use (high, medium, disabled)
 * @returns Opacity to use
 */

export const getTextOpacity = (emphasis: "high" | "medium" | "disabled") => {
  const opacities = {
    high: 0.87,
    medium: 0.6,
    disabled: 0.38,
  };
  return opacities[emphasis];
};

/** Gets according text colour with opacity for given theme background colour and emphasis.
 * @param bgColor Theme colour to put text on
 * @param themeMap Theme map to check against.
 * @param emphasis Emphasis to use (high, medium, disabled)
 * @param [defaultColor=themeMap.textHigh] Default text colour to use if no match found.
 * @returns Theme colour to use for text (with opacity)
 */

export const getTextColourOpacity = (
  bgColor: string,
  themeMap: ThemeMap,
  emphasis: "high" | "medium" | "disabled",
  defaultColor = themeMap.textHigh
) => alpha(getTextColour(bgColor, themeMap, defaultColor), getTextOpacity(emphasis));

export const saveTheme = () => {
  const interpolatedThemeMap = Object.entries(themesMap).reduce<Record<string, ThemeMap>>((prev, [key, val]) => {
    const [theme, prop] = key.split("|");

    const copy = { ...prev };

    if (prev[theme] === undefined) {
      copy[theme] = blankTheme;
    }

    const value = val === "true" || val === "false" ? val === "true" : val;
    const camelProp = camelise(prop, "-");
    if (hasKey(copy, theme) && hasKey(blankTheme, camelProp)) {
      copy[theme] = { ...copy[theme], [camelProp]: value };
    }
    return copy;
  }, {});
  dispatch(setThemeMaps(interpolatedThemeMap));
  const interpolatedGraphColors = Object.entries(graphMap).reduce<Record<string, string[]>>((obj, [key, val]) => {
    const [theme, indexString] = key.split("|");

    // SCSS lists start at 1
    const index = parseInt(indexString) - 1;

    if (obj[theme] === undefined) {
      obj[theme] = [];
    }
    if (hasKey(obj, theme)) {
      obj[theme][index] = val;
    }
    return obj;
  }, {});
  dispatch(setGraphColors(interpolatedGraphColors));
};

export const checkDevice = () => {
  let i = 0;
  let lastWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  let lastDevice = "tablet";
  let lastOrientation = "landscape";
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
    const orientation = window.matchMedia("(orientation: portrait)").matches ? "portrait" : "landscape";
    if (lastOrientation !== orientation) {
      dispatch(setOrientation(orientation));
      lastOrientation = orientation;
    }
  };
  calculate();
  window.addEventListener("resize", debounce(calculate, 1000));
};

export const getURLQuery = (state = store.getState()) => {
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
      dispatch(setMainSort(pageSort.calendar));
      dispatch(setMainSortOrder(pageSortOrder.calendar));
    }
  } else {
    dispatch(setAppPage("calendar"));
    dispatch(setMainSort(pageSort.calendar));
    dispatch(setMainSortOrder(pageSortOrder.calendar));
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
    if (index === array.length - 1 && Object.keys(whitelistObj).length > 0) {
      const defaultPreset = selectDefaultPreset(state);
      dispatch(setURLWhitelist(whitelistObj));
      dispatch(setCurrentPreset(defaultPreset));
      setWhitelistMerge({ ...defaultPreset.whitelist, ...whitelistObj }, false);
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

export const setPage = (page: Page, state = store.getState()) => {
  const {
    common: { page: appPage },
    main: { loading, urlSet, linkedFavorites },
    guides: { urlEntry: urlGuide },
    updates: { urlEntry: urlUpdate },
  } = state;
  if (page !== appPage && !loading && is<Page>(page)) {
    dispatch(setTransition(true));
    setTimeout(() => {
      dispatch(setMainSearch(""));
      dispatch(setAppPage(page));
      if (arrayIncludes(mainPages, page)) {
        dispatch(setMainSort(pageSort[page]));
        dispatch(setMainSortOrder(pageSortOrder[page]));
        filterData(store.getState());
      }
      document.documentElement.scrollTop = 0;
    }, 90);
    setTimeout(() => {
      dispatch(setTransition(true));
    }, 300);
    document.title = "KeycapLendar: " + pageTitle[page];
    const params = new URLSearchParams(window.location.search);
    params.delete("page");
    const pageParams = ["keysetId", "keysetAlias", "keysetName", "guideId", "updateId", "favoritesId"];
    pageParams.forEach((param) => {
      if (params.has(param)) {
        params.delete(param);
      }
    });
    if (urlSet.value) {
      dispatch(
        setURLSet({
          prop: "id",
          value: "",
        })
      );
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
    const urlParams = params.toString() ? "?" + params.toString() : "";
    window.history.pushState(
      {
        page: page,
      },
      "KeycapLendar: " + pageTitle[page],
      "/" + page + urlParams
    );
  }
};
