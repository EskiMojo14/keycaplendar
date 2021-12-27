import type { GuideEntryType } from "@s/guides/types";
import type { OldPresetType, PresetType, SetType } from "@s/main/types";
import type { Settings } from "@s/settings/types";
import type { UpdateEntryType } from "@s/updates/types";
import type { Overwrite } from "@s/util/types";

type FirestoreCollection<K, V, S = Record<string, never>> = {
  key: K;
  value: V;
  subCollections: S;
};

type FirestoreId<T extends string> = string & { [key in T]: never };

export type FirestoreType = {
  apiUsers: FirestoreCollection<ApiUserId, ApiUserDoc, { data: FirestoreCollection<ApiUserId, ApiUserDoc> }>;
  app: FirestoreCollection<"globals", GlobalDoc>;
  changelog: FirestoreCollection<ChangelogId, ChangelogDoc>;
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
    sales:
      string | {
          /** Direct URL to sales graph. */
          img: string;
          thirdParty: boolean;
        };
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
