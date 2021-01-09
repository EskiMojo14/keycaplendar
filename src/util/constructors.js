import { nanoid } from "nanoid";

export function Preset(
  name = "",
  favorites = false,
  hidden = false,
  profiles = [],
  shipped = [],
  vendorMode = "",
  vendors = [],
  id = nanoid()
) {
  this.name = name;
  this.id = id;
  this.whitelist = {
    favorites: favorites,
    hidden: hidden,
    profiles: profiles,
    shipped: shipped,
    vendorMode: vendorMode,
    vendors: vendors,
  };
}

export function Set(colorway = "", designer = [], details = "", icDate = "", id = "", image = "", profile = "") {
  this.colorway = colorway;
  this.designer = designer;
  this.details = details;
  this.icDate = icDate;
  this.id = id;
  this.image = image;
  this.profile = profile;
}
