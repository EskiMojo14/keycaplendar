import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";

export const baseApi = createApi({
  baseQuery: fakeBaseQuery(),
  endpoints: () => ({}),
  reducerPath: "api",
  tagTypes: ["Audit", "Update"],
});

export default baseApi;
