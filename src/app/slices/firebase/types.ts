import type { OldPresetType } from "../main/types";
import type { Settings } from "../settings/types";

type FirestoreCollection<K, V, S = Record<string, never>> = {
  key: K;
  value: V;
  subCollections: S;
};

type FirestoreId<T extends string> = string & { [key in T]: never };

export type FirestoreType = {
  apiUsers: FirestoreCollection<ApiUserId, ApiUserDoc, { data: FirestoreCollection<ApiUserId, ApiUserDoc> }>;
  app: FirestoreCollection<"globals", GlobalDoc>;
  users: FirestoreCollection<UserId, UserPreferencesDoc>;
};

export type ApiUserId = FirestoreId<"_apiUserId">;

export type ApiUserDoc = {
  apiAccess: boolean;
  apiKey: string;
  apiSecret: string;
  email: string;
};

export type GlobalDoc = {
  filterPresets: OldPresetType[];
};

export type UserId = FirestoreId<"_userId">;

export type UserPreferencesDoc = {
  filterPresets?: OldPresetType[];
  favorites?: string[];
  bought?: string[];
  hidden?: string[];
  settings?: Partial<Settings>;
  syncSettings?: boolean;
};
