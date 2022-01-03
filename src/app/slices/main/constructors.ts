import { nanoid } from "nanoid";
import { createFillFunc } from "@s/util/functions";
import type { Overwrite } from "@s/util/types";
import { blankKeyset, blankPreset, blankWhitelist } from "./constants";
import type { PresetType, WhitelistType } from "./types";

/**
 * Fills in partial whitelist with defaults.
 * @param partial
 * @returns Full whitelist type.
 */

export const partialWhitelist = createFillFunc(blankWhitelist);

/**
 * Fills in partial preset with defaults. Whitelist can be a partial too (see {@link partialWhitelist})
 * @param partial
 * @returns Full preset type.
 */

export const partialPreset = ({
  whitelist = {},
  id = nanoid(),
  ...partial
}: Partial<
  Overwrite<PresetType, { whitelist: Partial<WhitelistType> }>
> = {}): PresetType => ({
  ...blankPreset,
  id,
  ...partial,
  whitelist: partialWhitelist(whitelist),
});

/**
 * Fills in partial keyset with defaults.
 * @param partial
 * @returns Full keyset type.
 */

export const partialSet = createFillFunc(blankKeyset);
