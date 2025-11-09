import { api } from "./axios";

export type CounterpartyItem = { userId:number; displayName:string; email:string; net:number };
export type SummaryResp = { items: CounterpartyItem[] };
export const getBalancesSummary = async () => (await api.get<SummaryResp>("/balances/summary")).data;

export type WithUserResp = { userId:number; displayName:string; email:string; totalNet:number; groups:{groupId:number;groupName:string;net:number}[] };
export const getBalancesWithUser = async (userId:number) => (await api.get<WithUserResp>(`/balances/with/${userId}`)).data;
