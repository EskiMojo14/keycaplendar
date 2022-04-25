import type { WritableKeys } from "@s/util/types";

/**
 * Creates a URL object with specified options (uses current URL as base if not provided), and provides searchParams to function to modify
 * @param opts keys in URL object to modify
 * @param paramsMod Function which receives URLSearchParams and modifies it
 * @param returnLocation Whether to return a URL object, or a string compatible with `history`
 * @returns URL object or string
 * @example
 * const url = createURL({ pathname: "/page" }, (params) => {
 *   params.set("search", "test")
 * });
 * console.log(url.href) // <current URL>/page?search=test<rest>
 */
export const createURL = <ReturnLocation extends boolean = false>(
  {
    href = window.location.href,
    ...opts
  }: Partial<Pick<URL, WritableKeys<URL>>> = {},
  paramsMod?: (params: URLSearchParams) => void,
  returnLocation: ReturnLocation = false as ReturnLocation
): ReturnLocation extends true ? string : URL => {
  const url = new URL(href);
  Object.assign(url, opts);
  paramsMod?.(url.searchParams);
  return (
    returnLocation ? `${url.pathname}${url.search}${url.hash}` : url
  ) as ReturnLocation extends true ? string : URL;
};

/**
 * Loops through URL search params and clears all keys that aren't in `except` whitelist
 * @param params URLSearchParams to modify
 * @param except Keys to keep
 * @example
 * const params = new URLSearchParams("foo=1&bar=2");
 * clearSearchParamsExcept(params, ["bar"]);
 * console.log(params.toString()) // "bar=2"
 */

export const clearSearchParamsExcept = (
  params: URLSearchParams,
  except: string[] = []
) => {
  params.forEach((_, name) => {
    if (!except.includes(name)) {
      params.delete(name);
    }
  });
};

/**
 * Loops through an array to set all values.
 * @param params Params object to mutate
 * @param name param name
 * @param array array of values to set
 * @example
 * const params = new URLSearchParams();
 * setSearchParamArray(params, "foo", ["bar", "baz"]);
 * console.log(params.toString()) // "foo=bar&foo=baz"
 */

export const setSearchParamArray = (
  params: URLSearchParams,
  name: string,
  array: string[]
) => {
  params.delete(name);
  for (const value of array) {
    params.append(name, value);
  }
};
