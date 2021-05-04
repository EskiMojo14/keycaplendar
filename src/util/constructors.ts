import { nanoid } from "nanoid";
import { whitelistShipped } from "./constants";
import { WhitelistType } from "./types";

export class Interval {
  intervalId;
  constructor(callback: () => void, time: number) {
    this.intervalId = setInterval(callback, time);
  }
  clear() {
    clearTimeout(this.intervalId);
    console.log("clear");
  }
}
/**
 * Creates a standard whitelist object with specified values, or blank values if none specified.
 * Useful for creating blank whitelist objects.
 */

export class Whitelist {
  profiles: string[];
  shipped: string[];
  vendorMode: "exclude" | "include";
  vendors: string[];
  edited: string[];
  favorites: boolean;
  hidden: boolean;

  /**
   * @param favorites Whether to only display favourites.
   * @param hidden Whether to only display hidden sets.
   * @param profiles Array of allowed profiles.
   * @param shipped Array of allowed shipped values. Values are `"Shipped"` and `"Not shipped"`.
   * @param vendorMode Whether to `include` or `exclude` specified `vendors`.
   * @param vendors Vendors to be included or excluded.
   * @param edited Array of keys which have been edited.
   */

  constructor(
    favorites = false,
    hidden = false,
    profiles: string[] = [],
    shipped: string[] = whitelistShipped,
    vendorMode: "exclude" | "include" = "exclude",
    vendors: string[] = [],
    edited: string[] = []
  ) {
    this.profiles = profiles;
    this.shipped = shipped;
    this.vendorMode = vendorMode as "exclude" | "include";
    this.vendors = vendors;
    this.edited = edited;
    this.favorites = favorites;
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
   * @param favorites Whether to only display favourites.
   * @param hidden Whether to only display hidden sets.
   * @param profiles Array of allowed profiles.
   * @param shipped Array of allowed shipped values. Values are `"Shipped"` and `"Not shipped"`.
   * @param vendorMode Whether to `include` or `exclude` specified `vendors`.
   * @param vendors Vendors to be included or excluded.
   * @param id Internal ID. Will be generated with `nanoid()` if not provided.
   */

  constructor(
    name = "",
    global = false,
    favorites = false,
    hidden = false,
    profiles: string[] = [],
    shipped: string[] = [],
    regions: string[] = [],
    vendorMode: "exclude" | "include" = "exclude",
    vendors: string[] = [],
    id = nanoid()
  ) {
    this.name = name;
    this.id = id;
    this.global = global;
    this.whitelist = {
      favorites: favorites,
      hidden: hidden,
      profiles: profiles,
      shipped: shipped,
      regions: regions,
      vendorMode: vendorMode,
      vendors: vendors,
    };
  }
}

/**
 * Creates a standard keyset object with specified values, or blank values if none specified.
 * Useful for creating blank keyset objects.
 */
export class Keyset {
  colorway: string;
  designer: string[];
  details: string;
  icDate: string;
  gbLaunch: string;
  gbEnd: string;
  id: string;
  image: string;
  profile: string;
  constructor(
    colorway = "",
    designer = [],
    details = "",
    icDate = "",
    gbLaunch = "",
    gbEnd = "",
    id = "",
    image = "",
    profile = ""
  ) {
    this.colorway = colorway;
    this.designer = designer;
    this.details = details;
    this.icDate = icDate;
    this.gbLaunch = gbLaunch;
    this.gbEnd = gbEnd;
    this.id = id;
    this.image = image;
    this.profile = profile;
  }
}

/**
 * Creates a standard image info object with specified values, or blank values if none specified.
 * Useful for creating blank image info objects.
 */
export class ImageObj {
  name: string;
  parent: string;
  fullPath: string;
  src: string;
  constructor(name = "", parent = "", fullPath = "", src = "") {
    this.name = name;
    this.parent = parent;
    this.fullPath = fullPath;
    this.src = src;
  }
}

/**
 * Creates a standard user object with specified values, or blank values if none specified.
 * Useful for creating blank user objects.
 */

export class User {
  admin: boolean;
  designer: boolean;
  displayName: string;
  editor: boolean;
  email: string;
  nickname: string;
  photoURL: string;
  dateCreated: string;
  lastSignIn: string;
  lastActive: string;
  constructor(
    email = "",
    displayName = "",
    photoURL = "",
    nickname = "",
    designer = false,
    editor = false,
    admin = false,
    dateCreated = "",
    lastSignIn = "",
    lastActive = ""
  ) {
    this.admin = admin;
    this.designer = designer;
    this.displayName = displayName;
    this.editor = editor;
    this.email = email;
    this.nickname = nickname;
    this.photoURL = photoURL;
    this.dateCreated = dateCreated;
    this.lastSignIn = lastSignIn;
    this.lastActive = lastActive;
  }
}
