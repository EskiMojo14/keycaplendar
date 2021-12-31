/** Set properties to iterate and check. Order is also used for sorting. */

export const auditProperties = [
  "alias",
  "profile",
  "colorway",
  "designer",
  "icDate",
  "details",
  "notes",
  "gbMonth",
  "gbLaunch",
  "gbEnd",
  "image",
  "shipped",
  "vendors",
  "sales",
] as const;

/** Formatted names. */

export const auditPropertiesFormatted: Record<
  typeof auditProperties[number],
  string
> = {
  alias: "Alias",
  colorway: "Colorway",
  designer: "Designer(s)",
  details: "Link",
  gbEnd: "GB end",
  gbLaunch: "GB launch",
  gbMonth: "GB month",
  icDate: "IC date",
  image: "Image",
  notes: "Notes",
  profile: "Profile",
  sales: "Sales",
  shipped: "Shipped",
  vendors: "Vendors",
};
