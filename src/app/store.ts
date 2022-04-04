import { reduxBatch } from "@manaflair/redux-batch";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import type {
  Action,
  AnyAction,
  ThunkAction,
  UnsubscribeListener,
} from "@reduxjs/toolkit";
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

const reducers = {
  audit,
  common,
  guides,
  history,
  images,
  main,
  settings,
  statistics,
  updates,
  user,
  users,
};

const reducer = combineReducers(reducers);

export type RootState = ReturnType<typeof reducer>;

export type AppThunk<ReturnType> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;

const _createStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    enhancers: (enhancers) => [reduxBatch, ...enhancers, reduxBatch],
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }).prepend(listenerMiddleware),
    preloadedState,
    reducer,
  });

type BatchTuple = [AnyAction | AppThunk<any>, ...(AnyAction | AppThunk<any>)[]];

type DispatchActionReturn<DispatchedAction> = DispatchedAction extends AppThunk<
  infer ThunkReturn
>
  ? ThunkReturn
  : DispatchedAction extends Action<"listenerMiddleware/add">
  ? UnsubscribeListener
  : DispatchedAction;

type MapTupleToDispatchReturn<Actions extends BatchTuple> = {
  [Index in keyof Actions]: DispatchActionReturn<Actions[Index]>;
} & { length: Actions["length"] };

const createStore: (...params: Parameters<typeof _createStore>) => ReturnType<
  typeof _createStore
> & {
  dispatch: {
    <Actions extends BatchTuple>(
      actions: Actions
    ): MapTupleToDispatchReturn<Actions>;
  };
} = _createStore;

export type AppStore = ReturnType<typeof createStore>;

export type AppDispatch = AppStore["dispatch"];

export const store = createStore(loadState());

export default store;
