import { allPages, mainPages } from "./constants";

/** Alias for `Record<string, T>`. */

export type Obj<T = unknown> = Record<string, T>;

/** Makes specified keys optional. */

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

/** Overwrite keys with a new object. */

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

/** Create a union of all keys in object T which have values of V type. */

export type KeysMatching<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

/** Alias for standard HTML props. */

export type HTMLProps = React.HTMLAttributes<HTMLElement>;

/** Possible page names */

export type Page = typeof allPages[number];

/** Possible main page names */

export type MainPage = typeof mainPages[number];

export type ThemeMap = {
  dark: boolean;
  background: string;
  error: string;
  onError: string;
  onPrimary: string;
  onSecondary: string;
  onSurface: string;
  primary: string;
  secondary: string;
};
