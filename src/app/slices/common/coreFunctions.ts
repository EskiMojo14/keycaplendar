import { typedFirestore } from "../firebase/firestore";
import store from "../../store";
import { queue } from "../../snackbarQueue";
import { setAppPage, setDevice } from "./commonSlice";
import { allPages, mainPages, pageTitle, urlPages } from "./constants";
import { arrayEveryType, arrayIncludes } from "./functions";
import { Page } from "./types";
import { setURLEntry as setURLGuide } from "../guides/guidesSlice";
import { historyTabs } from "../history/constants";
import { setHistoryTab } from "../history/functions";
import {
  setSort as setMainSort,
  setSortOrder as setMainSortOrder,
  setSearch as setMainSearch,
  setAppPresets,
  setTransition,
  setURLSet,
  setLinkedFavorites,
  setURLWhitelist,
} from "../main/mainSlice";
import { allSorts, pageSort, pageSortOrder, sortBlacklist, whitelistParams, whitelistShipped } from "../main/constants";
import { filterData, getData, setWhitelistMerge, updatePreset } from "../main/functions";
import { WhitelistType } from "../main/types";
import { statsTabs } from "../statistics/constants";
import { setStatisticsTab } from "../statistics/functions";
import { setURLEntry as setURLUpdate } from "../updates/updatesSlice";
import { getLinkedFavorites } from "../user/functions";

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
      (arrayIncludes(allPages, pageQuery) && process.env.NODE_ENV === "development") ||
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
            if (
              arrayEveryType<typeof whitelistShipped[number]>(array, (item) => arrayIncludes(whitelistShipped, item))
            ) {
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
    if (urlTab && arrayIncludes(statsTabs, urlTab)) {
      setStatisticsTab(urlTab);
    }
  }
  if (params.has("historyTab")) {
    const urlTab = params.get("historyTab");
    if (urlTab && arrayIncludes(historyTabs, urlTab)) {
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

export const setPage = (page: Page) => {
  const {
    common: { page: appPage },
    main: { loading, allSets, urlSet, linkedFavorites },
    guides: { urlEntry: urlGuide },
    updates: { urlEntry: urlUpdate },
  } = store.getState();
  if (page !== appPage && !loading && arrayIncludes(allPages, page)) {
    dispatch(setTransition(true));
    setTimeout(() => {
      dispatch(setMainSearch(""));
      if (arrayIncludes(mainPages, page)) {
        filterData(page, allSets, pageSort[page], pageSortOrder[page], "");
        dispatch(setAppPage(page));
        dispatch(setMainSort(pageSort[page]));
        dispatch(setMainSortOrder(pageSortOrder[page]));
      } else {
        dispatch(setAppPage(page));
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
