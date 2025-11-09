
import { api } from "./axios";

/** ===== Types chung ===== */
export type GroupType = "GENERAL" | "TRIP" | "HOME" | "COUPLE";
export type Visibility = "PRIVATE" | "LINK" | "PUBLIC";
export type SplitMode = "EQUAL" | "PERCENT" | "AMOUNT" | "SHARE";

/** ===== Groups (list / create) ===== */
export type Group = {
  id: number;
  name: string;
  type: GroupType;
  startDate?: string | null;
  endDate?: string | null;
  destination?: string | null;
  defaultCurrency?: string | null;
  notes?: string | null;
  visibility: Visibility;
  imageUrl?: string | null;
};

export type CreateGroupReq = {
  name: string;
  type: GroupType;
  destination?: string | null;
  startDate?: string | null; // yyyy-MM-dd
  endDate?: string | null;   // yyyy-MM-dd
  defaultCurrency?: string | null;
  notes?: string | null;
};

export async function listGroupsApi(opts?: { signal?: AbortSignal }): Promise<Group[]> {
  const r = await api.get<Group[]>("/groups", { signal: opts?.signal });
  return r.data;
}

export async function createGroupApi(p: CreateGroupReq, opts?: { signal?: AbortSignal }): Promise<Group> {
  // (tuỳ chọn) chuẩn hoá: "" -> null để BE đỡ phải xử lý
  const normalize = (s?: string | null) => (s && s.trim() !== "" ? s : null);
  const payload = {
    ...p,
    destination: normalize(p.destination),
    defaultCurrency: normalize(p.defaultCurrency),
    notes: normalize(p.notes),
    startDate: p.startDate ?? null,
    endDate: p.endDate ?? null,
  };
  const r = await api.post<Group>("/groups", payload, { signal: opts?.signal });
  return r.data;
}

/** ===== Group detail / members / expenses ===== */
export type Member = {
  id: number;
  userId: number;
  displayName: string;
  email: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
};

export type Expense = {
  id: number;
  title: string;
  amount: number;
  currencyCode: string;
  paidById: number;
  splitMode: SplitMode;
  createdAt: string; // ISO datetime
};

export type GroupDetail = {
  id: number;
  name: string;
  type: GroupType;
  startDate?: string | null;
  endDate?: string | null;
  destination?: string | null;
  defaultCurrency?: string | null;
  visibility: Visibility;
  members: Member[];
  recentExpenses: Expense[];
   ownerId: number;        
  isOwner: boolean;
  imageUrl?: string | null;
};

export async function getGroupDetail(id: number, opts?: { signal?: AbortSignal }): Promise<GroupDetail> {
  const r = await api.get<GroupDetail>(`/groups/${id}`, { signal: opts?.signal });
  return r.data;
}

/** add member */
export type AddMemberReq = { userId: number };
export type AddMemberResp = Member;

export async function addMember(groupId: number, payload: AddMemberReq, opts?: { signal?: AbortSignal }): Promise<AddMemberResp> {
  const r = await api.post<AddMemberResp>(`/groups/${groupId}/members`, payload, { signal: opts?.signal });
  return r.data;
}

/** create expense */
export type CreateExpenseReq = {
  title: string;
  amount: number;
  currencyCode: string;
  paidById: number;
  splitMode: SplitMode;
  participants: { userId: number; share: number }[];
};
export type CreateExpenseResp = Expense;

export async function createExpense(groupId: number, payload: CreateExpenseReq, opts?: { signal?: AbortSignal }): Promise<CreateExpenseResp> {
  const r = await api.post<CreateExpenseResp>(`/groups/${groupId}/expenses`, payload, { signal: opts?.signal });
  return r.data;
}
export type NetRow = { fromUserId:number; toUserId:number; amount:number };
export async function getGroupBalances(groupId:number): Promise<NetRow[]> {
  const r = await api.get<NetRow[]>(`/groups/${groupId}/balances`);
  return r.data;
}

export async function deleteGroupApi(id: number): Promise<void> {
  await api.delete(`/groups/${id}`);
}

export type UpdateGroupReq = Partial<CreateGroupReq> & {
  visibility?: "PRIVATE"|"LINK"|"PUBLIC";
};

export async function updateGroupApi(id:number, payload:UpdateGroupReq) {
  const r = await api.patch<Group>(`/groups/${id}`, payload);
  return r.data;
}




export function resolveImageUrl(path?: string | null) {
  if (!path) return undefined;
  const baseURL = "http://10.0.2.2:8080/api";
  const root = baseURL.replace("/api", ""); // ví dụ http://10.0.2.2:8080
  return path.startsWith("http") ? path : root + path;
}

// app/src/api/groups.ts
// ...
export async function uploadGroupImageApi(id: number, uri: string) {
  const form = new FormData();
  form.append("file", {
    uri,
    type: "image/jpeg",
    name: "group.jpg",
  } as any);
  const res = await api.put(`/groups/${id}/image`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}