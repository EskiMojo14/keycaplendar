import { createSelector } from "@reduxjs/toolkit";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "~/app/store";
import type { AppStartListening } from "@mw/listener";
import { createErrorMessagesListener } from "@s/api/functions";

export const baseApi = createApi({
  baseQuery: fakeBaseQuery(),
  endpoints: () => ({}),
  reducerPath: "api",
});

export default baseApi;

export const setupApiErrorListener = (startListening: AppStartListening) =>
  createErrorMessagesListener(baseApi.reducerPath, startListening);

export const selectAllCachedArgsByQuery = createSelector(
  (state: RootState) => state[baseApi.reducerPath].queries,
  (_: unknown, endpointName: string) => endpointName,
  (queries, endpointName) =>
    Object.keys(queries)
      .filter((key) => key.startsWith(`${endpointName}(`))
      .map((key) =>
        JSON.parse(key.replace(`${endpointName}(`, "").replace(/\)$/, ""))
      )
);
