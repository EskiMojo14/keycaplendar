import { reduxBatch } from "@manaflair/redux-batch";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import type { Action, AnyAction, UnsubscribeListener } from "@reduxjs/toolkit";
import { connectRouter, routerMiddleware } from "connected-react-router";
import type { History } from "history";
import { createBrowserHistory } from "history";
import { loadState } from "~/app/local-storage";
import audit from "@s/audit";
import common from "@s/common";
import guides from "@s/guides";
import history from "@s/history";
import images from "@s/images";
import main from "@s/main";
import settings from "@s/settings";
import statistics from "@s/statistics";
import updates from "@s/updates";
import user from "@s/user";
import users from "@s/users";
import listenerMiddleware from "~/app/middleware/listener";

export const historyObj = createBrowserHistory();

const createRootReducer = <S = unknown>(historyObj: History<S>) => ({
  audit,
  common,
  guides,
  history,
  images,
  main,
  router: connectRouter(historyObj),
  settings,
  statistics,
  updates,
  user,
  users,
});

const reducer = combineReducers(createRootReducer(historyObj));

export type RootState = ReturnType<typeof reducer>;

export type AppThunk<ReturnType> = (
  // eslint-disable-next-line no-use-before-define
  dispatch: AppDispatch,
  getState: () => RootState,
  extraArgument?: never
) => ReturnType;

const _createStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    enhancers: (enhancers) => [reduxBatch, ...enhancers, reduxBatch],
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      })
        .concat(routerMiddleware(historyObj))
        .prepend(listenerMiddleware),
    preloadedState,
    reducer,
  });

export type BatchTuple = [
  AnyAction | AppThunk<any>,
  ...(AnyAction | AppThunk<any>)[]
];

export type DispatchActionReturn<DispatchedAction> =
  DispatchedAction extends AppThunk<infer ThunkReturn>
    ? ThunkReturn
    : DispatchedAction extends Action<"listenerMiddleware/add">
    ? UnsubscribeListener
    : DispatchedAction;

export type MapTupleToDispatchReturn<Actions extends BatchTuple> = {
  [Index in keyof Actions]: DispatchActionReturn<Actions[Index]>;
} & { length: Actions["length"] };

export const createStore: (
  ...params: Parameters<typeof _createStore>
) => ReturnType<typeof _createStore> & {
  dispatch: {
    <Actions extends BatchTuple>(
      actions: Actions
    ): MapTupleToDispatchReturn<Actions>;
  };
} = _createStore;

export type AppStore = ReturnType<typeof createStore>;

export type AppDispatch = AppStore["dispatch"];

export const store = createStore(loadState());

export const selectFromState =
  <Selected>(selector: (state: RootState) => Selected): AppThunk<Selected> =>
  (dispatch, getState) =>
    selector(getState());

export default store;
