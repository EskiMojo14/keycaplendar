import type { OldPresetType } from "../main/types";

type FirestoreCollection<K, V, S = Record<string, never>> = {
  key: K;
  value: V;
  subCollections: S;
};

type FirestoreId<T extends string> = string & { [key in T]: never };

export type FirestoreType = {
  apiUsers: FirestoreCollection<ApiUserId, ApiUserDoc, { data: FirestoreCollection<ApiUserId, ApiUserDoc> }>;
  app: FirestoreCollection<"globals", GlobalDoc>;
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
