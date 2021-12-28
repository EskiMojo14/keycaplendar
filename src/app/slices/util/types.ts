import { HTMLAttributes } from "react";

/** Alias for `Record<string, T>`. */

export type Obj<T> = Record<string, T>;

/** Makes specified keys optional. */

export type Optional<T, K extends keyof T> = Omit<T, K> & Pick<Partial<T>, K>;

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

export type HTMLProps = HTMLAttributes<HTMLElement>;
