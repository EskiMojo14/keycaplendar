/** Alias for `Record<string, T>`. */

export type Obj<T> = Record<string, T>;

/** An array of [key, value] tuples */
export type ObjectEntries<Obj extends Record<string, any>> = {
  [Key in keyof Obj]: [Key, Obj[Key]];
}[keyof Obj][];

/** Makes specified keys optional. */

export type Optional<T, K extends keyof T> = Omit<T, K> & Pick<Partial<T>, K>;

/** Overwrite keys with a new object. */

export type Overwrite<T, U> = Pick<T, Exclude<keyof T, keyof U>> & U;

/** Creates a type of keys from A and B where key and type are the same. */

export type Common<A, B> = Pick<
  A,
  {
    [K in keyof A & keyof B]: A[K] extends B[K]
      ? B[K] extends A[K]
        ? K
        : never
      : never;
  }[keyof A & keyof B]
>;

/** Create a union of all keys in object T which have values of V type. */

export type KeysMatching<T, V> = {
  [K in keyof T]-?: T[K] extends V ? K : never;
}[keyof T];

/** Compares two types and evaluates to `A` (`X` by default) if the same, otherwise evaluates to `B` (`never` by default) */

export type IfEquals<X, Y, A = X, B = never> = (<T>() => T extends X
  ? 1
  : 2) extends <T>() => T extends Y ? 1 : 2
  ? A
  : B;

export type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    P
  >;
}[keyof T];

export type ReadonlyKeys<T> = {
  [P in keyof T]-?: IfEquals<
    { [Q in P]: T[P] },
    { -readonly [Q in P]: T[P] },
    never,
    P
  >;
}[keyof T];

export type RemoveFirstFromTuple<T extends any[]> = T["length"] extends 0
  ? undefined
  : ((...b: T) => void) extends (a: any, ...b: infer I) => void
  ? I
  : [];

export type UnionToIntersection<U> = (
  U extends never ? never : (arg: U) => never
) extends (arg: infer I) => void
  ? I
  : never;

export type UnionToTuple<T> = UnionToIntersection<
  T extends never ? never : (t: T) => T
> extends (_: never) => infer W
  ? [...UnionToTuple<Exclude<T, W>>, W]
  : [];

type _TupleOf<T, N extends number, R extends unknown[]> = R["length"] extends N
  ? R
  : _TupleOf<T, N, [T, ...R]>;
export type Tuple<T, N extends number> = N extends N
  ? number extends N
    ? T[]
    : _TupleOf<T, N, []>
  : never;
