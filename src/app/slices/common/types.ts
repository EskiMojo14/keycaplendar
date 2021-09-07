import { allPages, mainPages } from "./constants";

/** Alias for `Record<string, T>`. */

export type Obj<T = unknown> = Record<string, T>;

/** Makes specified keys optional. */

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

/** Overwrite keys with a new object. */

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

/** Creates a type of keys from A and B where key and type are the same. */

export type Common<A, B> = Pick<
  A,
  {
    [K in keyof A & keyof B]: A[K] extends B[K] ? (B[K] extends A[K] ? K : never) : never;
  }[keyof A & keyof B]
>;

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
  primary: string;
  onPrimary: string;
  primaryDark: string;
  onPrimaryDark: string;
  primaryLight: string;
  onPrimaryLight: string;
  secondary: string;
  onSecondary: string;
  secondaryDark: string;
  onSecondaryDark: string;
  secondaryLight: string;
  onSecondaryLight: string;
  error: string;
  onError: string;
  surface: string;
  onSurface: string;

  textHigh: string;
  textMedium: string;
  textDisabled: string;

  meta: string;
  divider: string;
  lighterDivider: string;
  grey1: string;
  grey2: string;

  primaryGradient: string[];
  secondaryGradient: string[];
  elevatedSurface: string[];
};
