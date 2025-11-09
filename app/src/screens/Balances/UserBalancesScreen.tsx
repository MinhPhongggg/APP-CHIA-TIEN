// app/src/screens/Balances/UserBalancesScreen.tsx
import React, { useCallback } from "react";
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useBalancesWithUser } from "../../api/hooks";

export default function UserBalancesScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const userId = route.params?.userId as number | undefined;

  // ✅ Gọi hook 1 lần ở top-level; điều khiển fetch bằng enabled
  const { data, isLoading, isError, refetch, isRefetching } = useBalancesWithUser(userId, {
    enabled: !!userId,
  });

  // Early return CHỈ sau khi hook đã được gọi
  if (!userId) return <Text style={styles.errorMsg}>Thiếu userId</Text>;

  const fmt = useCallback(
    (n: number) =>
      n.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    []
  );

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Đang tải số dư…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Ionicons name="warning-outline" size={26} color="#ef4444" />
        <Text style={styles.error}>Lỗi tải số dư</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const totalNet = data?.totalNet ?? 0;
  const groups = data?.groups ?? [];

  return (
    <SafeAreaView edges={["bottom"]} style={styles.screen}>
      {/* Header card */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={20} color="#16a34a" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title} numberOfLines={1}>{data?.displayName}</Text>
          <Text style={styles.sub} numberOfLines={1}>{data?.email}</Text>
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.total, totalNet >= 0 ? styles.pos : styles.neg]}>
            {totalNet >= 0 ? `+${fmt(totalNet)}` : fmt(totalNet)}
          </Text>
          <Text style={styles.totalLabel}>Tổng</Text>
        </View>
      </View>

      {/* Danh sách theo nhóm */}
      <FlatList
        data={groups}
        keyExtractor={(g) => String(g.groupId)}
        refreshing={!!isRefetching}
        onRefresh={refetch}
        ListHeaderComponent={
          <View style={styles.sectionHeaderWrap}>
            <Text style={styles.sectionHeader}>Theo nhóm</Text>
          </View>
        }
        renderItem={({ item }) => {
          const positive = item.net > 0;
          return (
            <TouchableOpacity
              onPress={() => nav.navigate("GroupDetail", { id: item.groupId })}
              style={styles.card}
              activeOpacity={0.85}
            >
              <View style={styles.leftIcon}>
                <Ionicons name="albums-outline" size={18} color="#16a34a" />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.name} numberOfLines={1}>{item.groupName}</Text>
                <Text style={styles.hint} numberOfLines={1}>Nhấn để mở chi tiết nhóm</Text>
              </View>

              <Text style={[styles.amount, positive ? styles.pos : styles.neg]}>
                {positive ? `+${fmt(item.net)}` : fmt(item.net)}
              </Text>
              <Ionicons name="chevron-forward" size={18} color="#c7c7c7" />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="file-tray-outline" size={28} color="#9AA0A6" />
            <Text style={styles.emptyText}>Không có công nợ trong nhóm nào</Text>
          </View>
        }
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#f7f7f7" },
  errorMsg: { margin: 16, color: "red" },

  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { color: "#666", marginTop: 8 },
  error: { marginTop: 6, color: "#ef4444", fontWeight: "600" },
  retryBtn: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  retryText: { color: "#111" },

  headerCard: {
    backgroundColor: "#fff",
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 10, backgroundColor: "#E8F5E9",
    alignItems: "center", justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "800", color: "#111" },
  sub: { color: "#666", marginTop: 2 },
  total: { fontWeight: "800", fontSize: 16 },
  totalLabel: { color: "#777", fontSize: 12 },

  sectionHeaderWrap: { paddingTop: 16, paddingBottom: 8 },
  sectionHeader: { fontWeight: "700", fontSize: 16, color: "#111" },

  card: {
    flexDirection: "row", alignItems: "center", gap: 12,
    backgroundColor: "#fff", padding: 12, borderRadius: 12, marginTop: 10,
    shadowColor: "#000", shadowOpacity: 0.06, shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3, elevation: 2,
  },
  leftIcon: {
    width: 36, height: 36, borderRadius: 8, backgroundColor: "#E8F5E9",
    alignItems: "center", justifyContent: "center",
  },
  name: { fontWeight: "700", color: "#111" },
  hint: { color: "#888", fontSize: 12, marginTop: 2 },
  amount: { fontWeight: "800", minWidth: 90, textAlign: "right" },
  pos: { color: "#16a34a" },
  neg: { color: "#ef4444" },

  emptyBox: {
    alignItems: "center", justifyContent: "center",
    paddingVertical: 32, gap: 8,
  },
  emptyText: { color: "#666" },
});
