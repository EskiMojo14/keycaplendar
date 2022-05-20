import { createSelector } from "@reduxjs/toolkit";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "~/app/store";

export const baseApi = createApi({
  baseQuery: fakeBaseQuery(),
  endpoints: () => ({}),
  reducerPath: "api",
  tagTypes: ["Guide", "Update"],
});

export default baseApi;

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
