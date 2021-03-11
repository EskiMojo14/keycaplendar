import { nanoid } from "nanoid";
import { MainWhitelistType } from "./types";

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
  id: string;
  image: string;
  profile: string;
  constructor(colorway = "", designer = [], details = "", icDate = "", id = "", image = "", profile = "") {
    this.colorway = colorway;
    this.designer = designer;
    this.details = details;
    this.icDate = icDate;
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
