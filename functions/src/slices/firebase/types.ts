import type { Overwrite } from "../common/types";
import type { GuideEntryType } from "../guides/types";
import type { OldPresetType, PresetType, SetType } from "../main/types";
import type { Settings } from "../settings/types";
import type { UpdateEntryType } from "../updates/types";

type FirestoreCollection<K, V, S = Record<string, never>> = {
  key: K;
  value: V;
  subCollections: S;
};

type FirestoreId<T extends string> = string & { [key in T]: never };

export type FirestoreType = {
  apiUsers: FirestoreCollection<
    ApiUserId,
    ApiUserDoc,
    { data: FirestoreCollection<ApiUserId, ApiUserDoc> }
  >;
  app: FirestoreCollection<"globals", GlobalDoc>;
  changelog: FirestoreCollection<ChangelogId, ChangelogDoc>;
  guides: FirestoreCollection<GuideId, Omit<GuideEntryType, "id">>;
  keysets: FirestoreCollection<KeysetId, KeysetDoc>;
  updates: FirestoreCollection<UpdateId, UpdateEntryType>;
  users: FirestoreCollection<UserId, UserPreferencesDoc>;
};

export type ApiUserId = FirestoreId<"_apiUserId">;

export type ApiUserDoc = {
  apiAccess: boolean;
  apiKey: string;
  apiSecret: string;
  email: string;
};

export type ChangelogId = FirestoreId<"_changelogId">;

export type ChangelogDoc = {
  after: Partial<KeysetDoc>;
  before: Partial<KeysetDoc>;
  documentId: string;
  timestamp: string;
  user: {
    displayName: string;
    email: string;
    nickname: string;
  };
};

export type KeysetId = FirestoreId<"_keysetId">;

export type KeysetDoc = Overwrite<
  Omit<SetType, "id">,
  {
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
  shareName?: string;
  filterPresets?: (OldPresetType | PresetType)[];
  favorites?: string[];
  favoritesId?: string;
  bought?: string[];
  hidden?: string[];
  settings?: Partial<Settings>;
  syncSettings?: boolean;
};
