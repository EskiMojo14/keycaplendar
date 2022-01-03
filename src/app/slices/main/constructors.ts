import { nanoid } from "nanoid";
import type { Overwrite } from "@s/util/types";
import type { PresetType, SetType, WhitelistType } from "./types";

/**
 * Fills in partial whitelist with defaults.
 * @param partial
 * @returns Full whitelist type.
 */

export const partialWhitelist = (
  partial: Partial<WhitelistType> = {}
): WhitelistType => ({
  bought: false,
  edited: [],
  favorites: false,
  hidden: "unhidden",
  profiles: [],
  regions: [],
  shipped: ["Shipped", "Not shipped"],
  vendorMode: "exclude",
  vendors: [],
  ...partial,
});

/**
 * Fills in partial preset with defaults. Whitelist can be a partial too (see {@link partialWhitelist})
 * @param partial
 * @returns Full preset type.
 */

export const partialPreset = ({
  whitelist,
  ...partial
}: Partial<
  Overwrite<PresetType, { whitelist: Partial<WhitelistType> }>
> = {}): PresetType => ({
  global: false,
  id: nanoid(),
  name: "",
  ...partial,
  whitelist: partialWhitelist(whitelist),
});

/**
 * Fills in partial keyset with defaults.
 * @param partial
 * @returns Full keyset type.
 */

export const partialSet = (partial: Partial<SetType> = {}): SetType => ({
  alias: "",
  colorway: "",
  designer: [],
  details: "",
  gbEnd: "",
  gbLaunch: "",
  gbMonth: false,
  icDate: "",
  id: "",
  image: "",
  notes: "",
  profile: "",
  sales: {
    img: "",
    thirdParty: false,
  },
  shipped: false,
  vendors: [],
  ...partial,
});
