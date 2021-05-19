/** Set properties to iterate and check. Order is also used for sorting. */

export const auditProperties = [
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

export const auditPropertiesFormatted: Record<typeof auditProperties[number], string> = {
  profile: "Profile",
  colorway: "Colorway",
  designer: "Designer(s)",
  icDate: "IC date",
  details: "Link",
  notes: "Notes",
  gbMonth: "GB month",
  gbLaunch: "GB launch",
  gbEnd: "GB end",
  image: "Image",
  shipped: "Shipped",
  vendors: "Vendors",
  sales: "Sales",
};
