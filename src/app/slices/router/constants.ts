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

export const mainPages: (keyof typeof routes)[] = [
  "archive",
  "bought",
  "calendar",
  "favorites",
  "guides",
  "hidden",
  "ic",
  "live",
  "previous",
  "timeline",
];
