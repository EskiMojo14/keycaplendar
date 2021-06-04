export type CurrentUserType = {
  /** URL to avatar image. */
  avatar: string;
  email: string;
  /** UID provided by Firebase Auth. */
  id: string;
  isAdmin: boolean;
  isDesigner: boolean;
  isEditor: boolean;
  name: string;
  /** Custom nickname for user, for display. */
  nickname: string;
};
