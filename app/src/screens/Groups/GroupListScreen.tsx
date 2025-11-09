// app/src/screens/Groups/GroupListScreen.tsx
import React, { useLayoutEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useGroups } from "../../api/hooks";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

type GroupItem = {
  id: number;
  name: string;
  type: "GENERAL" | "TRIP" | "HOME" | "COUPLE";
  destination?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  defaultCurrency?: string | null;
  notes?: string | null;
  // membersCount?: number; // nếu server có thì mở dòng này
};

const typeIcon: Record<GroupItem["type"], IoniconName> = {
  GENERAL: "people-outline",
  TRIP: "airplane-outline",
  HOME: "home-outline",
  COUPLE: "heart-outline",
};

export default function GroupListScreen() {
  const nav = useNavigation<any>();
  const { data: groups = [], isLoading, error, refetch, isRefetching } = useGroups();

  useLayoutEffect(() => {
    nav.setOptions({
      title: "Nhóm",
      headerRight: () => (
        <TouchableOpacity style={styles.headerBtn} onPress={() => nav.navigate("AddGroup")}>
          <Ionicons name="add-circle-outline" size={22} color="#007AFF" />
          <Text style={styles.headerBtnText}>Tạo</Text>
        </TouchableOpacity>
      ),
    });
  }, [nav]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Đang tải nhóm…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Lỗi tải nhóm</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={groups}
        keyExtractor={(item: GroupItem) => String(item.id)}
        refreshControl={
          <RefreshControl refreshing={!!isRefetching} onRefresh={refetch} tintColor="#16a34a" />
        }
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Ionicons name="albums-outline" size={28} color="#9AA0A6" />
            <Text style={styles.emptyText}>Chưa có nhóm</Text>
            <Text style={styles.emptyHint}>Nhấn nút “+” để tạo nhóm mới</Text>
          </View>
        }
        renderItem={({ item }) => {
          const icon = typeIcon[item.type] ?? "albums-outline";
          const isTrip = item.type === "TRIP";
          const hasDates = !!item.startDate && !!item.endDate;

          return (
            <TouchableOpacity
              onPress={() => nav.navigate("GroupDetail", { id: item.id })}
              style={styles.card}
              activeOpacity={0.8}
            >
              {/* Left icon */}
              <View style={styles.leftIcon}>
                <Ionicons name={icon} size={22} color="#16a34a" />
              </View>
            
              {/* Content */}
              <View style={styles.cardBody}>
                <Text style={styles.title} numberOfLines={1}>
                  {item.name}
                </Text>

                <View style={styles.metaRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{item.type}</Text>
                  </View>
                  {item.defaultCurrency ? (
                    <View style={[styles.badge, styles.badgeSoft]}>
                      <Ionicons name="pricetag-outline" size={12} color="#2563eb" />
                      <Text style={[styles.badgeText, styles.badgeSoftText]}>
                        {item.defaultCurrency}
                      </Text>
                    </View>
                  ) : null}
                </View>

                {item.destination ? (
                  <View style={styles.row}>
                    <Ionicons name="location-outline" size={14} color="#666" />
                    <Text style={styles.secondary} numberOfLines={1}>
                      {item.destination}
                    </Text>
                  </View>
                ) : null}

                {isTrip && hasDates ? (
                  <View style={styles.row}>
                    <Ionicons name="calendar-outline" size={14} color="#666" />
                    <Text style={styles.secondary}>
                      {item.startDate} → {item.endDate}
                    </Text>
                  </View>
                ) : null}
              </View>

              {/* Right chevron */}
              <Ionicons name="chevron-forward" size={20} color="#9AA0A6" />
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => nav.navigate("AddGroup")}
        style={styles.fab}
        activeOpacity={0.9}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f7f7f7" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  muted: { color: "#666", marginTop: 8 },
  error: { color: "#ef4444", fontWeight: "600", marginBottom: 8 },
  retryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  retryText: { color: "#111" },

  headerBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 8 },
  headerBtnText: { color: "#007AFF", fontSize: 16, fontWeight: "600" },

  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#fff",
    padding: 14,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 2,
  },
  leftIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#E8F5E9",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700", color: "#111" },
  metaRow: { flexDirection: "row", gap: 8, marginTop: 6, flexWrap: "wrap" },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: "600", color: "#333" },

  badgeSoft: {
    backgroundColor: "#EFF6FF",
    borderColor: "#dbeafe",
  },
  badgeSoftText: { color: "#2563eb" },

  row: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  secondary: { color: "#666" },

  emptyBox: { alignItems: "center", marginTop: 60, gap: 6 },
  emptyText: { fontSize: 16, fontWeight: "700", color: "#111" },
  emptyHint: { color: "#666" },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#16a34a",
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
});
