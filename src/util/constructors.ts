import { nanoid } from "nanoid";
import { MainWhitelistType } from "./types";

export class Whitelist {
  profiles: string[];
  shipped: string[];
  vendorMode: "exclude" | "include";
  vendors: string[];
  constructor(
    profiles: string[] = [],
    shipped: string[] = [],
    vendorMode: "exclude" | "include" = "exclude",
    vendors: string[] = [],
  ) {
    this.profiles = profiles;
    this.shipped = shipped;
    this.vendorMode = vendorMode as "exclude" | "include";
    this.vendors = vendors;
  }
}

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
    id = nanoid(),
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

export class Set {
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
    profile = "",
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
    admin = false,
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
