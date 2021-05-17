import { nanoid } from "nanoid";
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
  shipped: WhitelistType["shipped"];
  regions: string[];
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
   * @param regions Array of allowed vendor regions.
   * @param vendorMode Whether to `include` or `exclude` specified `vendors`.
   * @param vendors Vendors to be included or excluded.
   * @param edited Array of keys which have been edited.
   */

  constructor(
    favorites = false,
    hidden = false,
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

  constructor(name = "", global = false, whitelist: WhitelistType = new Whitelist(), id = nanoid()) {
    this.name = name;
    this.id = id;
    this.global = global;
    this.whitelist = whitelist;
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

export class Update {
  id: string;
  name: string;
  title: string;
  date: string;
  body: string;
  pinned: boolean;
  constructor(user = "", title = "", date = "", body = "", pinned = false, id = "") {
    this.name = user;
    this.title = title;
    this.date = date;
    this.body = body;
    this.pinned = pinned;
    this.id = id;
  }
}
