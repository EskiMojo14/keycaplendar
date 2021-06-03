import { GuideEntryType } from "../guides/types";
import type { OldPresetType } from "../main/types";
import type { Settings } from "../settings/types";
import { UpdateEntryType } from "../updates/types";

type FirestoreCollection<K, V, S = Record<string, never>> = {
  key: K;
  value: V;
  subCollections: S;
};

type FirestoreId<T extends string> = string & { [key in T]: never };

export type FirestoreType = {
  apiUsers: FirestoreCollection<ApiUserId, ApiUserDoc, { data: FirestoreCollection<ApiUserId, ApiUserDoc> }>;
  app: FirestoreCollection<"globals", GlobalDoc>;
  guides: FirestoreCollection<GuideId, Exclude<GuideEntryType, "id">>;
  updates: FirestoreCollection<UpdateId, Exclude<UpdateEntryType, "id">>;
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

export type GuideId = FirestoreId<"_guideId">;

export type UpdateId = FirestoreId<"_updateId">;

export type UserId = FirestoreId<"_userId">;

export type UserPreferencesDoc = {
  filterPresets?: OldPresetType[];
  favorites?: string[];
  bought?: string[];
  hidden?: string[];
  settings?: Partial<Settings>;
  syncSettings?: boolean;
};
