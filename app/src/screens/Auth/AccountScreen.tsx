// // app/src/screens/Account/AccountScreen.tsx
// import React from "react";
// import {
//   View, Text, TextInput, Image, Alert, TouchableOpacity,
//   StyleSheet, ActivityIndicator, ScrollView,
// } from "react-native";
// import { SafeAreaView } from "react-native-safe-area-context";
// import { Ionicons } from "@expo/vector-icons";
// import { useNavigation } from "@react-navigation/native";
// import AsyncStorage from "@react-native-async-storage/async-storage";

// import { useMe, useUpdateMe, useChangePassword } from "../../api/hooks";
// import { setAuth } from "../../api/axios";
// import { useSetAuthToken } from "../../store/auth";

// export default function AccountScreen() {
//   const nav = useNavigation<any>();

//   // ✅ HOOKS (gọi 1 lần, top-level)
//   const { data: me, isLoading, isError, refetch } = useMe();
//   const update = useUpdateMe();
//   const changePwd = useChangePassword();
//   const setAuthToken = useSetAuthToken();

//   // ✅ State cục bộ (không tạo thêm hook conditionally)
//   const [displayName, setDisplayName] = React.useState("");
//   const [avatarUrl, setAvatarUrl] = React.useState("");
//   const [oldPass, setOldPass] = React.useState("");
//   const [newPass, setNewPass] = React.useState("");

//   // nạp dữ liệu vào form khi me có
//   React.useEffect(() => {
//     if (me) {
//       setDisplayName(me.displayName ?? "");
//       setAvatarUrl(me.avatarUrl ?? "");
//     }
//   }, [me]);

//   async function onSaveProfile() {
//     try {
//       await update.mutateAsync({ displayName, avatarUrl });
//       Alert.alert("Thành công", "Đã cập nhật hồ sơ");
//     } catch (e: any) {
//       Alert.alert("Lỗi", e?.response?.data?.message ?? "Cập nhật thất bại");
//     }
//   }

//   async function onChangePwd() {
//     if (!oldPass || !newPass) return Alert.alert("Lỗi", "Nhập đủ mật khẩu");
//     try {
//       await changePwd.mutateAsync({ oldPassword: oldPass, newPassword: newPass });
//       setOldPass(""); setNewPass("");
//       Alert.alert("OK", "Đổi mật khẩu thành công");
//     } catch (e: any) {
//       Alert.alert("Lỗi", e?.response?.data?.message ?? "Đổi mật khẩu thất bại");
//     }
//   }

//   async function onLogout() {
//     try {
//       await AsyncStorage.removeItem("accessToken");
//       setAuth(undefined);
//       setAuthToken(null);
//     } catch {
//       Alert.alert("Lỗi", "Không thể đăng xuất");
//     }
//   }

//   // ✅ Các nhánh render sau khi hook đã được gọi (an toàn hooks)
//   if (isLoading) {
//     return (
//       <View style={styles.center}>
//         <ActivityIndicator size="large" />
//         <Text style={styles.muted}>Đang tải tài khoản…</Text>
//       </View>
//     );
//   }
//   if (isError || !me) {
//     return (
//       <View style={styles.center}>
//         <Ionicons name="warning-outline" size={26} color="#ef4444" />
//         <Text style={styles.err}>Không tải được thông tin</Text>
//           <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
//           <Text style={styles.retryText}>Thử lại</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <SafeAreaView edges={["bottom"]} style={styles.screen}>
//       <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
//         {/* Header */}
//         <View style={styles.cardHeader}>
//           <View style={styles.avatarWrap}>
//             <Image
//               source={ me.avatarUrl ? { uri: me.avatarUrl } : require("../../../../assets/avatar-placeholder.png") }
//               style={styles.avatar}
//             />
//           </View>
//           <View style={{ flex: 1 }}>
//             <Text style={styles.email}>{me.email}</Text>
//             <Text style={styles.uid}>ID: {me.id}</Text>
//           </View>
          
//             <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
//             <Ionicons name="refresh-outline" size={18} color="#007AFF" />
//           </TouchableOpacity>
//         </View>

//         {/* Hồ sơ */}
//         <Text style={styles.groupTitle}>Hồ sơ</Text>
//         <View style={styles.card}>
//           <Text style={styles.label}>Tên hiển thị</Text>
//           <TextInput
//             value={displayName}
//             onChangeText={setDisplayName}
//             placeholder="Tên của bạn"
//             style={styles.input}
//           />

//           <Text style={[styles.label, { marginTop: 10 }]}>Avatar URL</Text>
//           <TextInput
//             value={avatarUrl}
//             onChangeText={setAvatarUrl}
//             placeholder="https://…"
//             autoCapitalize="none"
//             style={styles.input}
//           />

//           <TouchableOpacity
//             onPress={onSaveProfile}
//             style={[styles.primaryBtn, update.isPending && styles.btnDisabled]}
//             disabled={update.isPending}
//             activeOpacity={0.85}
//           >
//             <Text style={styles.primaryText}>
//               {update.isPending ? "Đang lưu..." : "Lưu thông tin"}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Đổi mật khẩu */}
//         <Text style={styles.groupTitle}>Bảo mật</Text>
//         <View style={styles.card}>
//           <Text style={styles.label}>Mật khẩu hiện tại</Text>
//           <TextInput
//             secureTextEntry
//             value={oldPass}
//             onChangeText={setOldPass}
//             placeholder="Nhập mật khẩu hiện tại"
//             style={styles.input}
//           />

//           <Text style={[styles.label, { marginTop: 10 }]}>Mật khẩu mới</Text>
//           <TextInput
//             secureTextEntry
//             value={newPass}
//             onChangeText={setNewPass}
//             placeholder="Nhập mật khẩu mới"
//             style={styles.input}
//           />

//           <TouchableOpacity
//             onPress={onChangePwd}
//             style={[styles.secondaryBtn, changePwd.isPending && styles.btnDisabled]}
//             disabled={changePwd.isPending}
//             activeOpacity={0.85}
//           >
//             <Text style={styles.secondaryText}>
//               {changePwd.isPending ? "Đang đổi..." : "Đổi mật khẩu"}
//             </Text>
//           </TouchableOpacity>
//         </View>

//         {/* Đăng xuất */}
//         <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} activeOpacity={0.85}>
//           <Ionicons name="log-out-outline" size={18} color="#fff" />
//           <Text style={styles.logoutText}>Đăng xuất</Text>
//         </TouchableOpacity>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// /* ----------------- STYLES ----------------- */
// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: "#f7f7f7" },
//   center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
//   muted: { color: "#666", marginTop: 8 },
//   err: { color: "#ef4444", marginTop: 6, fontWeight: "600" },
//   retryBtn: { marginTop: 10, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: "#ddd" },
//   retryText: { color: "#111" },

//   cardHeader: {
//     backgroundColor: "#fff",
//     padding: 14,
//     borderRadius: 12,
//     flexDirection: "row",
//     alignItems: "center",
//     gap: 12,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowOffset: { width: 0, height: 1 },
//     shadowRadius: 3,
//     elevation: 2,
//     marginBottom: 12,
//   },
//   avatarWrap: {
//     width: 56, height: 56, borderRadius: 28, overflow: "hidden",
//     backgroundColor: "#E8F5E9",
//   },
//   avatar: { width: "100%", height: "100%" },
//   email: { fontWeight: "700", color: "#111" },
//   uid: { color: "#666", marginTop: 2, fontSize: 12 },
//   iconBtn: { padding: 8, borderRadius: 8, backgroundColor: "#F1F5FF" },

//   groupTitle: { fontWeight: "700", fontSize: 16, color: "#111", marginTop: 12, marginBottom: 8 },
//   card: {
//     backgroundColor: "#fff",
//     padding: 14,
//     borderRadius: 12,
//     shadowColor: "#000",
//     shadowOpacity: 0.06,
//     shadowOffset: { width: 0, height: 1 },
//     shadowRadius: 3,
//     elevation: 2,
//     gap: 6,
//   },
//   label: { color: "#333", fontWeight: "600" },
//   input: {
//     borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
//     padding: 10, backgroundColor: "#fff",
//   },

//   primaryBtn: {
//     marginTop: 12, backgroundColor: "#16a34a", paddingVertical: 12,
//     alignItems: "center", borderRadius: 10,
//   },
//   primaryText: { color: "#fff", fontWeight: "800" },

//   secondaryBtn: {
//     marginTop: 12, backgroundColor: "#007AFF10", paddingVertical: 12,
//     alignItems: "center", borderRadius: 10, borderWidth: 1, borderColor: "#007AFF30",
//   },
//   secondaryText: { color: "#007AFF", fontWeight: "800" },

//   btnDisabled: { opacity: 0.7 },

//   logoutBtn: {
//     marginTop: 16,
//     backgroundColor: "#ef4444",
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: "center",
//     flexDirection: "row",
//     justifyContent: "center",
//     gap: 8,
//   },
//   logoutText: { color: "#fff", fontWeight: "800" },
// });


// app/src/screens/Account/AccountScreen.tsx
import React from "react";
import {
  View, Text, TextInput, Image, Alert, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import {
  useMe, useUpdateMe, useChangePassword, useUploadAvatar
} from "../../api/hooks";
import { resolveImageUrl } from "../../api/groups";
import { setAuth } from "../../api/axios";
import { useSetAuthToken } from "../../store/auth";

export default function AccountScreen() {
  const nav = useNavigation<any>();

  const { data: me, isLoading, isError, refetch } = useMe();
  const update = useUpdateMe();
  const changePwd = useChangePassword();
  const uploadAvatar = useUploadAvatar();
  const setAuthToken = useSetAuthToken();

  const [oldPass, setOldPass] = React.useState("");
  const [newPass, setNewPass] = React.useState("");

  async function onChangeAvatar() {
    Alert.alert(
      "Đổi ảnh đại diện",
      "Chọn ảnh từ thư viện của bạn?",
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Chọn ảnh",
          onPress: async () => {
            // ... (Code xin quyền và mở thư viện ảnh giữ nguyên)
            const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (perm.status !== "granted") {
              Alert.alert("Lỗi", "Bạn cần cấp quyền truy cập thư viện ảnh.");
              return;
            }
            const res = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.8,
              aspect: [1, 1],
            });
            if (res.canceled) return;
            const uri = res.assets[0].uri;

            // Tải ảnh lên
            try {
              // 1. CHỈ CẦN GỌI HOOK UPLOAD AVATAR
              // Backend sẽ tự động lưu file VÀ cập nhật u.setAvatarUrl(webUrl)
              await uploadAvatar.mutateAsync(uri);
              
              // 2. ⛔️ KHÔNG CẦN GỌI update.mutateAsync NỮA
              // (Vì backend đã làm việc đó rồi)

              Alert.alert("Thành công", "Đã cập nhật ảnh đại diện!");
              refetch(); // Chỉ cần tải lại thông tin 'me'
            } catch (e: any) {
              Alert.alert("Lỗi", e?.response?.data?.message ?? "Không thể tải ảnh lên");
            }
          },
        },
      ]
    );
  }

  async function onChangePwd() {
    if (!oldPass || !newPass) return Alert.alert("Lỗi", "Nhập đủ mật khẩu");
    try {
      await changePwd.mutateAsync({ oldPassword: oldPass, newPassword: newPass });
      setOldPass(""); setNewPass("");
      Alert.alert("OK", "Đổi mật khẩu thành công");
    } catch (e: any) {
      Alert.alert("Lỗi", e?.response?.data?.message ?? "Đổi mật khẩu thất bại");
    }
  }

  async function onLogout() {
    try {
      await AsyncStorage.removeItem("accessToken");
      setAuth(undefined);
      setAuthToken(null);
    } catch {
      Alert.alert("Lỗi", "Không thể đăng xuất");
    }
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Đang tải tài khoản…</Text>
      </View>
    );
  }
  if (isError || !me) {
    return (
      <View style={styles.center}>
        <Ionicons name="warning-outline" size={26} color="#ef4444" />
        <Text style={styles.err}>Không tải được thông tin</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <TouchableOpacity
            onPress={onChangeAvatar}
            disabled={uploadAvatar.isPending || update.isPending}
            activeOpacity={0.8}
          >
            <View style={styles.avatarWrap}>
              <Image
                source={
                  me.avatarUrl
                    ? { uri: resolveImageUrl(me.avatarUrl) } // Dùng hàm resolve
                    : require("../../../../assets/avatar-placeholder.png")
                }
                style={styles.avatar}
              />

              {/* Icon camera đã được xóa bỏ khỏi đây */}

              {(uploadAvatar.isPending || update.isPending) && (
                <View style={styles.avatarLoading}>
                  <ActivityIndicator color="#fff" />
                </View>
              )}
            </View>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.groupTitle}>{me.displayName}</Text>
            <Text style={styles.email}>{me.email}</Text>
            
          </View>

          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => nav.navigate("EditProfile", { me })}
            activeOpacity={0.8}
          >
            <Ionicons name="pencil-outline" size={18} color="#007AFF" />
          </TouchableOpacity>
        </View>

        {/* Bảo mật */}
        <Text style={styles.groupTitle}>Bảo mật</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Mật khẩu hiện tại</Text>
          <TextInput
            secureTextEntry
            value={oldPass}
            onChangeText={setOldPass}
            placeholder="Nhập mật khẩu hiện tại"
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 10 }]}>Mật khẩu mới</Text>
          <TextInput
            secureTextEntry
            value={newPass}
            onChangeText={setNewPass}
            placeholder="Nhập mật khẩu mới"
            style={styles.input}
          />

          <TouchableOpacity
            onPress={onChangePwd}
            style={[styles.secondaryBtn, changePwd.isPending && styles.btnDisabled]}
            disabled={changePwd.isPending}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryText}>
              {changePwd.isPending ? "Đang đổi..." : "Đổi mật khẩu"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Đăng xuất */}
        <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={18} color="#fff" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f7f7" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { color: "#666", marginTop: 8 },
  err: { color: "#ef4444", marginTop: 6, fontWeight: "600" },
  retryBtn: { padding: 8, borderRadius: 8, borderWidth: 1, borderColor: "#ddd" },
  retryText: { color: "#111" },

  cardHeader: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 12,
  },
  avatarWrap: {
    width: 56, height: 56, borderRadius: 28, overflow: "hidden",
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: { width: "100%", height: "100%", position: "absolute" },
  avatarEditIcon: {
    position: "absolute",
    bottom: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 4,
    borderRadius: 6,
  },
  avatarLoading: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  email: { fontWeight: "700", color: "#111" },
  uid: { color: "#666", marginTop: 2, fontSize: 12 },
  iconBtn: { padding: 8, borderRadius: 8, backgroundColor: "#F1F5FF" },

  groupTitle: { fontWeight: "700", fontSize: 16, color: "#111", marginTop: 12, marginBottom: 8 },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
    gap: 6,
  },
  label: { color: "#333", fontWeight: "600" },
  input: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    padding: 10, backgroundColor: "#fff",
  },

  secondaryBtn: {
    marginTop: 12, backgroundColor: "#007AFF10", paddingVertical: 12,
    alignItems: "center", borderRadius: 10, borderWidth: 1, borderColor: "#007AFF30",
  },
  secondaryText: { color: "#007AFF", fontWeight: "800" },
  btnDisabled: { opacity: 0.7 },

  logoutBtn: {
    marginTop: 16,
    backgroundColor: "#ef4444",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  logoutText: { color: "#fff", fontWeight: "800" },
});
