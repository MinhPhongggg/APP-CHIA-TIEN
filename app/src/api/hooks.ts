
import { useQuery, useMutation, useQueryClient, useInfiniteQuery, keepPreviousData } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { registerApi, loginApi, AuthResp } from "../api/auth";
import {
  listGroupsApi,
  createGroupApi,
  CreateGroupReq,
  Group,
  getGroupBalances,
  deleteGroupApi,
  updateGroupApi,
  getGroupDetail,
  addMember,
  createExpense,
} from "./groups";
import { searchUsers } from "./users";
import { setAuth } from "./axios";
import { useSetAuthToken } from "../store/auth";
import { getActivities, FeedResp } from "./activities";
import {
  ExpenseSplitMode,
} from "../api/expense";

import { api } from "./axios";

// --- AUTH ---
export const useRegister = () => {
  const setToken = useSetAuthToken();
  return useMutation<AuthResp, any, { email: string; displayName: string; password: string }>({
    mutationFn: registerApi,
    onSuccess: async (res) => {
      const t = res.accessToken;
      setAuth(t);
      await AsyncStorage.setItem("accessToken", t);
      setToken(t);
    },
  });
};

export const useLogin = () => {
  const setToken = useSetAuthToken();
  return useMutation<AuthResp, any, { email: string; password: string }>({
    mutationFn: loginApi,
    onSuccess: async (res) => {
      const t = res.accessToken;
      setAuth(t);
      await AsyncStorage.setItem("accessToken", t);
      setToken(t);
    },
  });
};

// --- GROUPS ---
export const useGroups = () =>
  useQuery<Group[]>({
    queryKey: ["groups"],
    queryFn: listGroupsApi,
    placeholderData: keepPreviousData, // giữ UI mượt khi refetch
  });

export const useCreateGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: CreateGroupReq) => createGroupApi(p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"], exact: true });
    },
  });
};

export const useGroupDetail = (id?: number, opts?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["group", id],
    queryFn: () => getGroupDetail(id!), // an toàn vì enabled sẽ chặn khi !id
    enabled: !!id && (opts?.enabled ?? true),
    placeholderData: keepPreviousData,
  });

export const useAddMember = (groupId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: { userId: number }) => addMember(groupId, p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group", groupId], exact: true });
    },
  });
};

export const useCreateExpense = (groupId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: any) => createExpense(groupId, p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group", groupId], exact: true });
      qc.invalidateQueries({ queryKey: ["balances", groupId], exact: true });
      qc.invalidateQueries({ queryKey: ["balances-summary"], exact: true });
      // feed
      qc.invalidateQueries({ queryKey: ["activities"], exact: false }); // cho cả all và group
    },
  });
};

export function useUserSearch(query: string, opts?: { enabled?: boolean }) {
  const enabled = (opts?.enabled ?? true) && query.trim().length >= 2;
  return useQuery({
    queryKey: ["userSearch", query],
    queryFn: () => searchUsers(query),
    enabled,
    staleTime: 60_000,
    placeholderData: keepPreviousData,
  });
}

export const useGroupBalances = (groupId?: number, opts?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["balances", groupId],
    queryFn: () => getGroupBalances(groupId!),
    enabled: !!groupId && (opts?.enabled ?? true),
    placeholderData: keepPreviousData,
  });

// --- PROFILE ---
import * as profile from "./profile";
import { getBalancesSummary, getBalancesWithUser, SummaryResp, WithUserResp } from "./balances";
import axios from "axios";
import { CommentDto, ExpenseDetailDto } from "./expense";

export const useMe = () =>
  useQuery({
    queryKey: ["me"],
    queryFn: profile.getMe,
    placeholderData: keepPreviousData,
  });

export const useUpdateMe = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: profile.updateMe,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["me"], exact: true }),
  });
};

export const useChangePassword = () => useMutation({ mutationFn: profile.changePassword });

export const useDeleteGroup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteGroupApi(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["groups"], exact: true });
      // có thể xóa cache group cũ nếu muốn:
      // qc.removeQueries({ queryKey: ["group", id], exact: true });
    },
  });
};

export const useBalancesSummary = () =>
  useQuery<SummaryResp>({
    queryKey: ["balances-summary"],
    queryFn: getBalancesSummary,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: keepPreviousData,
  });

export const useBalancesWithUser = (userId?: number, opts?: { enabled?: boolean }) =>
  useQuery<WithUserResp>({
    queryKey: ["balances-with", userId],
    queryFn: () => getBalancesWithUser(userId!),
    enabled: !!userId && (opts?.enabled ?? true),
    staleTime: 30_000,
    placeholderData: keepPreviousData,
  });

export function useActivities(groupId?: number) {
  return useInfiniteQuery<FeedResp>({
    queryKey: ["activities", groupId ?? "all"],
    initialPageParam: 0,
    queryFn: ({ pageParam }) => {
      const cursor = typeof pageParam === "number" && pageParam > 0 ? pageParam : undefined;
      return getActivities({ groupId, cursor, limit: 20 });
    },
    getNextPageParam: (last) => last.nextCursor ?? undefined,
  });
}

export const useUpdateGroup = (groupId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (p: any) => updateGroupApi(groupId, p),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group", groupId], exact: true });
      qc.invalidateQueries({ queryKey: ["groups"], exact: true });
      qc.invalidateQueries({ queryKey: ["activities"], exact: false });
    },
  });
};

// --- EXPENSES ---

// ---- Expense Detail ----
export function useExpenseDetail(expenseId?: number, opts?: any){
  return useQuery<ExpenseDetailDto | null>({
    queryKey: ["expense", expenseId],
    queryFn: async () => {
      if(!expenseId) return null;
      const { data } = await api.get(`/expenses/${expenseId}`);
      return data as ExpenseDetailDto;
    },
    enabled: !!expenseId,
    ...opts,
  });
}

// ---- Expense Comments ----
export function useExpenseComments(expenseId?: number, opts?: any){
  return useQuery<CommentDto[]>({
    queryKey: ["expense", expenseId, "comments"],
    queryFn: async () => {
      if(!expenseId) return [];
      const { data } = await api.get(`/expenses/${expenseId}/comments`);
      return data as CommentDto[];
    },
    enabled: !!expenseId,
    ...opts,
  });
}

type UpdatePayload = {
  title: string;
  amount: number;
  currencyCode: string;
  paidById: number;
  splitMode: ExpenseSplitMode;
  participants: { userId: number; share: number }[];
};

export function useUpdateExpense(expenseId: number){
  const qc = useQueryClient();
  return useMutation<ExpenseDetailDto, any, UpdatePayload>({
    mutationFn: async (payload) => {
      const { data } = await api.put(`/expenses/${expenseId}`, payload);
      return data as ExpenseDetailDto;
    },
    onSuccess: (data) => {
      qc.setQueryData(["expense", expenseId], data);
      qc.invalidateQueries({ queryKey: ["group-detail"] });
    }
  });
}

export function useAddExpenseComment(expenseId: number){
  const qc = useQueryClient();
  return useMutation<CommentDto, any, string>({
    mutationFn: async (content) => {
      const { data } = await api.post(`/expenses/${expenseId}/comments`, { content });
      return data as CommentDto;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expense", expenseId, "comments"] });
    }
  });
}
import { uploadGroupImageApi } from "./groups";
export const useUploadGroupImage = (groupId: number) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uri: string) => uploadGroupImageApi(groupId, uri),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["group", groupId] });
      qc.invalidateQueries({ queryKey: ["groups"] });
    },
  });
};

export function useUploadAvatar() {
  const qc = useQueryClient();
  return useMutation({
    // 1. Gọi hàm từ profile.ts (sạch sẽ hơn)
    mutationFn: profile.uploadAvatar, 
    
    // 2. Cập nhật cache khi thành công
    onSuccess: (data) => {
      // 'data' là MeResp mới mà backend trả về
      qc.setQueryData(['me'], data);
    },
  });
}