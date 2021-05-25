import { OldPresetType } from "../main/types";
import { allPages, mainPages } from "./constants";

/** Alias for `Record<string, T>`. */

export type Obj<T = unknown> = Record<string, T>;

/** Makes specified keys optional. */

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

/** Overwrite keys with a new object. */

export type Overwrite<T1, T2> = {
  [P in Exclude<keyof T1, keyof T2>]: T1[P];
} &
  T2;

/** Alias for standard HTML props. */

export type HTMLProps = React.HTMLAttributes<HTMLElement>;

/** Possible page names */

export type Page = typeof allPages[number];

/** Possible main page names */

export type MainPage = typeof mainPages[number];

export type GlobalDoc = {
  filterPresets: OldPresetType[];
};