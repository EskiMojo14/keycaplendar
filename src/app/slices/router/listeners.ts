import type { AnyAction } from "@reduxjs/toolkit";
import type { History } from "history";
import { history } from "~/app/history";
import type { AppDispatch, BatchTuple } from "~/app/store";
import {
  selectURLEntry as selectURLGuide,
  setURLEntry as setURLGuide,
} from "@s/guides";
import {
  selectLinkedFavorites,
  selectURLSet,
  setLinkedFavorites,
  setSearch as setMainSearch,
  setURLSet,
} from "@s/main";
import {
  selectURLEntry as selectURLUpdate,
  setURLEntry as setURLUpdate,
} from "@s/updates";
import { createURL } from "@s/util/functions";
import { getPageTitle, locationChange, push } from ".";

export const setupLocationChangeListener = (
  listen: History["listen"],
  dispatch: AppDispatch
) =>
  listen((location, action) => {
    dispatch(locationChange(location, action));

    const title = getPageTitle(location.pathname);
    document.title = title ? `KeycapLendar: ${title}` : "KeycapLendar";

    dispatch((dispatch: AppDispatch, getState) => {
      const state = getState();
      const urlSet = selectURLSet(state);
      const linkedFavorites = selectLinkedFavorites(state);
      const urlGuide = selectURLGuide(state);
      const urlUpdate = selectURLUpdate(state);
      setTimeout(() => {
        dispatch(setMainSearch(""));
        document.documentElement.scrollTop = 0;
      }, 90);
      const actions: AnyAction[] = [];
      if (urlSet.value) {
        actions.push(setURLSet("id", ""));
      }
      if (urlGuide) {
        actions.push(setURLGuide(""));
      }
      if (urlUpdate) {
        actions.push(setURLUpdate(""));
      }
      if (linkedFavorites.array.length > 0) {
        actions.push(setLinkedFavorites({ array: [], displayName: "" }));
      }
      dispatch(actions as BatchTuple);
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
    });
  });
