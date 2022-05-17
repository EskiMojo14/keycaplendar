import { addListener, createListenerMiddleware } from "@reduxjs/toolkit";
import type { TypedAddListener, TypedStartListening } from "@reduxjs/toolkit";
import { setupPersistListener } from "~/app/local-storage";
import type { AppDispatch, RootState } from "~/app/store";
import { setupAuditListeners } from "@s/audit";
import { setupCommonListeners } from "@s/common";
import { setupGuideListeners } from "@s/guides";
import { setupHiddenSetsListener } from "@s/main";
import { setupUpdateListeners } from "@s/updates";

export const listenerMiddleware = createListenerMiddleware();

export type AppStartListening = TypedStartListening<RootState, AppDispatch>;

export const startAppListening =
  listenerMiddleware.startListening as AppStartListening;

export const addAppListener = addListener as TypedAddListener<
  RootState,
  AppDispatch
>;

setupPersistListener(startAppListening);

setupHiddenSetsListener(startAppListening);

setupAuditListeners(startAppListening);

setupCommonListeners(startAppListening);

setupGuideListeners(startAppListening);

setupUpdateListeners(startAppListening);

export default listenerMiddleware.middleware;
