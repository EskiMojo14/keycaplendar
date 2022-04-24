import type { mainPages, routes } from "@s/router/constants";

export type Page = keyof typeof routes;

/** Possible main page names */

export type MainPage = typeof mainPages[number];
