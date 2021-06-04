import { Overwrite } from "../common/types";
import { GuideEntryType } from "../guides/types";
import type { OldPresetType, PresetType, SetType } from "../main/types";
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
  guides: FirestoreCollection<GuideId, Omit<GuideEntryType, "id">>;
  keysets: FirestoreCollection<KeysetId, KeysetDoc>;
  updates: FirestoreCollection<UpdateId, Omit<UpdateEntryType, "id">>;
  users: FirestoreCollection<UserId, UserPreferencesDoc>;
};

export type ApiUserId = FirestoreId<"_apiUserId">;

export type ApiUserDoc = {
  apiAccess: boolean;
  apiKey: string;
  apiSecret: string;
  email: string;
};

export type KeysetId = FirestoreId<"_keysetId">;

export type KeysetDoc = Overwrite<
  Omit<SetType, "id">,
  {
    sales:
      | {
          /** Direct URL to sales graph. */
          img: string;
          thirdParty: boolean;
        }
      | string;
    latestEditor: string;
  }
>;

export type GlobalDoc = {
  filterPresets: (OldPresetType | PresetType)[];
};

export type GuideId = FirestoreId<"_guideId">;

export type UpdateId = FirestoreId<"_updateId">;

export type UserId = FirestoreId<"_userId">;

export type UserPreferencesDoc = {
  filterPresets?: (OldPresetType | PresetType)[];
  favorites?: string[];
  bought?: string[];
  hidden?: string[];
  settings?: Partial<Settings>;
  syncSettings?: boolean;
};
