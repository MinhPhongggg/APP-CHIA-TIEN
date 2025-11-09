
import { api } from "./axios";

export type MeResp = { id:number; email:string; displayName:string; avatarUrl?:string|null };
export type UpdateProfileReq = { displayName: string; avatarUrl?: string | null };
export type ChangePasswordReq = { oldPassword: string; newPassword: string };

export async function getMe(): Promise<MeResp> {
  const r = await api.get<MeResp>("/me"); 
  return r.data;
}
export async function updateMe(p: UpdateProfileReq): Promise<MeResp> {
  const r = await api.put<MeResp>("/me", p); 
  return r.data;
}
export async function changePassword(p: ChangePasswordReq): Promise<void> {
  await api.put("/me/password", p);
}
export function resolveImageUrl(path?: string | null) {
  if (!path) return undefined;
  const baseURL = "http://10.0.2.2:8080/api";
  const root = baseURL.replace("/api", ""); // ví dụ http://10.0.2.2:8080
  return path.startsWith("http") ? path : root + path;
}

export async function uploadAvatar(localUri: string): Promise<MeResp> {
  const formData = new FormData();
  
  // 1. Dùng logic "cứng" giống hệt groups.ts (đang hoạt động)
  formData.append("file", {
    uri: localUri,
    type: "image/jpeg", // Ghi cứng type
    name: "avatar.jpg", // Ghi cứng tên
  } as any);

  // 2. ✅ THÊM LẠI KHỐI HEADERS NÀY (Đây là mấu chốt)
  const { data } = await api.put<MeResp>("/me/image", formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  
  return data;
}