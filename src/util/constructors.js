import { nanoid } from "nanoid";

export function Preset(name = "", favorites = false, profiles = [], shipped = [], vendorMode = "", vendors = []) {
  this.name = name;
  this.id = nanoid();
  this.whitelist = {
    favorites: favorites,
    profiles: profiles,
    shipped: shipped,
    vendorMode: vendorMode,
    vendors: vendors,
  };
}
