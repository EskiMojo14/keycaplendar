import { is } from "typescript-is";
import { push } from "connected-react-router";
import store from "~/app/store";
import { mainPages, pageTitle } from "@s/common/constants";
import { arrayIncludes } from "@s/common/functions";
import { Page } from "@s/common/types";
import {
  setSort as setMainSort,
  setSortOrder as setMainSortOrder,
  setSearch as setMainSearch,
  setTransition,
  setURLSet,
  setLinkedFavorites,
} from "@s/main/mainSlice";
import { pageSort, pageSortOrder } from "@s/main/constants";
import { filterData } from "@s/main/functions";
import { setURLEntry as setURLUpdate } from "@s/updates/updatesSlice";
import { setURLEntry as setURLGuide } from "@s/guides/guidesSlice";

const { dispatch } = store;

export const setPage = (page: Page, state = store.getState()) => {
  const {
    router: {
      location: { pathname: appPage },
    },
    main: { loading, urlSet, linkedFavorites },
    guides: { urlEntry: urlGuide },
    updates: { urlEntry: urlUpdate },
  } = state;
  if (page !== appPage && !loading && is<Page>(page)) {
    dispatch(setTransition(true));
    setTimeout(() => {
      dispatch(setMainSearch(""));
      document.title = "KeycapLendar: " + pageTitle[page];
      const params = new URLSearchParams(window.location.search);
      params.delete("page");
      const pageParams = ["keysetId", "keysetAlias", "keysetName", "guideId", "updateId", "favoritesId"];
      pageParams.forEach((param) => {
        if (params.has(param)) {
          params.delete(param);
        }
      });
      const urlParams = params.toString() ? "?" + params.toString() : "";
      dispatch(push({ pathname: page, search: urlParams }));
      if (arrayIncludes(mainPages, page)) {
        dispatch(setMainSort(pageSort[page]));
        dispatch(setMainSortOrder(pageSortOrder[page]));
        filterData(store.getState());
      }
      document.documentElement.scrollTop = 0;

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
    }, 90);
    setTimeout(() => {
      dispatch(setTransition(true));
    }, 300);
  }
};
