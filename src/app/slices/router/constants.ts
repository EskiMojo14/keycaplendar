export const routes = {
  archive: "/archive/:keyset?",
  audit: "/audit",
  bought: "/bought/:keyset?",
  calendar: "/calendar/:keyset?",
  favorites: "/favorites/:keyset?",
  guides: "/guides/:id?",
  hidden: "/hidden/:keyset?",
  history: "/history/:tab?",
  ic: "/ic/:keyset?",
  images: "/images",
  live: "/live/:keyset?",
  previous: "/previous/:keyset?",
  settings: "/settings",
  statistics: "/statistics/:tab?",
  timeline: "/timeline/:keyset?",
  updates: "/updates",
  users: "/users",
};

const idPageList = <
  Pages extends [keyof typeof routes, ...(keyof typeof routes)[]]
>(
  ...pages: Pages
) => pages;

export const mainPages = idPageList(
  "archive",
  "bought",
  "calendar",
  "favorites",
  "hidden",
  "ic",
  "live",
  "previous",
  "timeline"
);
