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
