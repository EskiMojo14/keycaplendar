import { nanoid } from "nanoid";
import type { SetType, VendorType, WhitelistType } from "./types";

/**
 * Creates a standard whitelist object with specified values, or blank values if none specified.
 * Useful for creating blank whitelist objects.
 */

export class Whitelist {
  profiles: string[];
  shipped: WhitelistType["shipped"];
  regions: string[];
  vendorMode: "exclude" | "include";
  vendors: string[];
  edited: string[];
  favorites: boolean;
  bought: boolean;
  hidden: "all" | "hidden" | "unhidden";

  /**
   * @param favorites Whether to only display favorites.
   * @param bought Whether to only display bought sets.
   * @param hidden Whether to only display hidden sets.
   * @param profiles Array of allowed profiles.
   * @param shipped Array of allowed shipped values. Values are `"Shipped"` and `"Not shipped"`.
   * @param regions Array of allowed vendor regions.
   * @param vendorMode Whether to `include` or `exclude` specified `vendors`.
   * @param vendors Vendors to be included or excluded.
   * @param edited Array of keys which have been edited.
   */

  constructor(
    favorites = false,
    bought = false,
    hidden: "all" | "hidden" | "unhidden" = "unhidden",
    profiles: string[] = [],
    shipped: WhitelistType["shipped"] = ["Shipped", "Not shipped"],
    regions: string[] = [],
    vendorMode: "exclude" | "include" = "exclude",
    vendors: string[] = [],
    edited: string[] = []
  ) {
    this.profiles = profiles;
    this.shipped = shipped as WhitelistType["shipped"];
    this.regions = regions;
    this.vendorMode = vendorMode as "exclude" | "include";
    this.vendors = vendors;
    this.edited = edited;
    this.favorites = favorites;
    this.bought = bought;
    this.hidden = hidden;
  }
}

/**
 * Creates a standard whitelist preset object with specified values, or blank values if none specified.
 * Useful for creating blank whitelist preset objects.
 */

export class Preset {
  name: string;
  id: string;
  global: boolean;
  whitelist: WhitelistType;

  /**
   * @param name Display name for preset.
   * @param global If the preset is global.
   * @param whitelist Whitelist to use.
   * @param id Internal ID. Will be generated with `nanoid()` if not provided.
   */

  constructor(
    name = "",
    global = false,
    whitelist: WhitelistType = { ...new Whitelist() },
    id = nanoid()
  ) {
    this.name = name;
    this.id = id;
    this.global = global;
    this.whitelist = whitelist;
  }
}

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
