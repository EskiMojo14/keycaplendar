import { nanoid } from "nanoid";

export function Preset(
  name = "",
  favorites = false,
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
    profiles: profiles,
    shipped: shipped,
    vendorMode: vendorMode,
    vendors: vendors,
  };
}
