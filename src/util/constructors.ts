import { nanoid } from "nanoid";
import { whitelistShipped } from "./constants";
import { MainWhitelistType } from "./types";

/**
 * Creates interval with clear method.
 */
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
  constructor(
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
  }
}

/**
 * Creates a standard whitelist preset object with specified values, or blank values if none specified.
 * Useful for creating blank whitelist preset objects.
 */

export class Preset {
  name: string;
  id: string;
  whitelist: MainWhitelistType;
  constructor(
    name = "",
    favorites = false,
    hidden = false,
    profiles: string[] = [],
    shipped: string[] = [],
    vendorMode = "exclude",
    vendors: string[] = [],
    id = nanoid()
  ) {
    this.name = name;
    this.id = id;
    this.whitelist = {
      favorites: favorites,
      hidden: hidden,
      profiles: profiles,
      shipped: shipped,
      vendorMode: vendorMode as "exclude" | "include",
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
  constructor(
    email = "",
    displayName = "",
    photoURL = "",
    nickname = "",
    designer = false,
    editor = false,
    admin = false
  ) {
    this.admin = admin;
    this.designer = designer;
    this.displayName = displayName;
    this.editor = editor;
    this.email = email;
    this.nickname = nickname;
    this.photoURL = photoURL;
  }
}
