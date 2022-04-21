import type { LocationDescriptor } from "history";
import { history } from "~/app/history";
import type { AppThunk } from "~/app/store";
import { mainPages, pageTitle } from "@s/common/constants";
import { triggerTransition } from "@s/common/thunks";
import {
  selectURLEntry as selectURLGuide,
  setURLEntry as setURLGuide,
} from "@s/guides";
import {
  selectLinkedFavorites,
  selectURLSet,
  setLinkedFavorites,
  setSearch as setMainSearch,
  setSort as setMainSort,
  setSortOrder as setMainSortOrder,
  setURLSet,
} from "@s/main";
import { pageSort, pageSortOrder } from "@s/main/constants";
import { getPageName, push } from "@s/router";
import {
  selectURLEntry as selectURLUpdate,
  setURLEntry as setURLUpdate,
} from "@s/updates";
import { arrayIncludes, createURL } from "@s/util/functions";

export const setPage =
  (location: LocationDescriptor): AppThunk<void> =>
  (dispatch, getState) => {
    const state = getState();
    const page = getPageName(
      typeof location === "string" ? location : location.pathname ?? "/"
    );
    const urlSet = selectURLSet(state);
    const linkedFavorites = selectLinkedFavorites(state);
    const urlGuide = selectURLGuide(state);
    const urlUpdate = selectURLUpdate(state);
    dispatch(triggerTransition());
    setTimeout(() => {
      dispatch([setMainSearch("")]);
      if (arrayIncludes(mainPages, page)) {
        dispatch([
          setMainSort(pageSort[page]),
          setMainSortOrder(pageSortOrder[page]),
        ]);
      }
      dispatch(push(location));
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
    const pageParams = [
      "keysetId",
      "keysetAlias",
      "keysetName",
      "guideId",
      "updateId",
      "favoritesId",
    ];
    const params = new URLSearchParams(history.location.search);
    if (pageParams.some((param) => params.has(param))) {
      const newUrl = createURL(
        {},
        (params) => {
          params.delete("page");
          pageParams.forEach((param) => {
            if (params.has(param)) {
              params.delete(param);
            }
          });
        },
        true
      );
      dispatch(push(newUrl));
    }
  };
