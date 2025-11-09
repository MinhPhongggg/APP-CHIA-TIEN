// app/src/screens/Account/EditProfileScreen.tsx
import React from "react";
import {
  View, Text, TextInput, Alert, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useUpdateMe } from "../../api/hooks";
import { ui, text, colors, spacing } from "../../styles/style"; // Giả sử import từ style chung

export default function EditProfileScreen() {
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { me } = route.params; // Lấy dữ liệu 'me' được truyền từ AccountScreen

  // Hook để cập nhật
  const update = useUpdateMe();

  // State cục bộ cho form
  const [displayName, setDisplayName] = React.useState(me.displayName ?? "");
  const [avatarUrl, setAvatarUrl] = React.useState(me.avatarUrl ?? "");

  async function onSaveProfile() {
    try {
      await update.mutateAsync({ displayName, avatarUrl });
      Alert.alert("Thành công", "Đã cập nhật hồ sơ");
      nav.goBack(); // Quay lại màn hình Account
    } catch (e: any) {
      Alert.alert("Lỗi", e?.response?.data?.message ?? "Cập nhật thất bại");
    }
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.screen}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
        <Text style={styles.groupTitle}>Cập nhật hồ sơ</Text>
        <View style={styles.card}>
          <Text style={styles.label}>Tên hiển thị</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Tên của bạn"
            style={styles.input}
          />

          <Text style={[styles.label, { marginTop: 10 }]}>Avatar URL (Tùy chọn)</Text>
          <TextInput
            value={avatarUrl}
            onChangeText={setAvatarUrl}
            placeholder="https://… (để trống nếu dùng ảnh tải lên)"
            autoCapitalize="none"
            style={styles.input}
          />

          <TouchableOpacity
            onPress={onSaveProfile}
            style={[styles.primaryBtn, update.isPending && styles.btnDisabled]}
            disabled={update.isPending}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryText}>
              {update.isPending ? "Đang lưu..." : "Lưu thông tin"}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.note}>
          Lưu ý: Bạn có thể tải ảnh đại diện trực tiếp bằng cách bấm vào avatar
          ở màn hình Tài khoản.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ----------------- STYLES ----------------- */
// Bạn có thể copy các style liên quan từ AccountScreen.tsx
// Hoặc import chúng từ file style chung
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f7f7" },
  groupTitle: { fontWeight: "700", fontSize: 16, color: "#111", marginBottom: 8 },
  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    gap: 6,
  },
  label: { color: "#333", fontWeight: "600" },
  input: {
    borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10,
    padding: 10, backgroundColor: "#fff",
  },
  primaryBtn: {
    marginTop: 12, backgroundColor: "#16a34a", paddingVertical: 12,
    alignItems: "center", borderRadius: 10,
  },
  primaryText: { color: "#fff", fontWeight: "800" },
  btnDisabled: { opacity: 0.7 },
  note: {
    color: colors.sub,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing.md,
  }
});