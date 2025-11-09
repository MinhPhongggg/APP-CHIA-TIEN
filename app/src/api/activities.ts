import { api } from "./axios";

export type ActivityItem = {
  id: number;
  groupId: number | null;
  actorUserId: number;
  type: "EXPENSE_CREATED" | "MEMBER_ADDED" | "PAYMENT_ADDED";
  subjectId?: number | null;
  amount?: number | null;
  currencyCode?: string | null;
  message?: string | null;
  createdAt: string;
  groupName?: string | null;
};

export type FeedResp = { items: ActivityItem[]; nextCursor?: number | null };

export async function getActivities(params: { groupId?: number; cursor?: number; limit?: number }) {
  const r = await api.get<FeedResp>("/activities", { params });
  return r.data;
}
