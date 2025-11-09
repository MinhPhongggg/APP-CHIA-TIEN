// app/src/screens/Activities/ActivityFeedScreen.tsx
import React, { useMemo, useCallback } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useActivities } from "../../api/hooks";
import type { ActivityItem } from "../../api/activities";
import { ui, text, colors, spacing } from "../../../src/styles/style";

type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

const typeIcon: Record<string, IoniconName> = {
  EXPENSE_CREATED: "receipt-outline",
  EXPENSE_UPDATED: "create-outline",
  EXPENSE_DELETED: "trash-outline",
  MEMBER_ADDED: "person-add-outline",
  MEMBER_REMOVED: "person-remove-outline",
  PAYMENT_ADDED: "card-outline",
  PAYMENT_DELETED: "card-outline",
  DEFAULT: "notifications-outline",
};

function iconFor(type?: string): IoniconName {
  return typeIcon[type ?? ""] ?? typeIcon.DEFAULT;
}

function fmtDate(iso?: string) {
  if (!iso) return "-";
  return new Date(iso).toLocaleString();
}

export default function ActivityFeedScreen() {
  const nav = useNavigation<any>();

  // ✅ Hook luôn gọi theo cùng thứ tự, không bọc điều kiện
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
    isRefetching,
  } = useActivities();

  // ✅ Refetch khi tab focus (hook vẫn gọi mọi render)
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  const items: ActivityItem[] = useMemo(
    () => data?.pages?.flatMap((p) => p.items) ?? [],
    [data]
  );

  const keyExtractor = useCallback((it: ActivityItem) => String(it.id), []);

  const renderRow = useCallback(
    ({ item }: { item: ActivityItem }) => {
      const pressable = !!item.groupId;
      return (
        <TouchableOpacity
          activeOpacity={pressable ? 0.85 : 1}
          onPress={() => item.groupId && nav.navigate("GroupDetail", { id: item.groupId })}
          style={ui.rowCard}
        >
          <View style={[ui.avatar, { width: 36, height: 36, backgroundColor: "#E8F5E9" }]}>
            <Ionicons name={iconFor(item.type)} size={20} color={colors.success} />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={[text.body, { fontWeight: "700" }]} numberOfLines={2}>
              {item.message ?? item.type ?? "Hoạt động"}
            </Text>

            <View style={[ui.row, { flexWrap: "wrap", gap: 10, marginTop: 8 }]}>
              {item.groupName ? (
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                    borderWidth: 1,
                    borderColor: "#dbeafe",
                    backgroundColor: "#EFF6FF",
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Ionicons name="people-outline" size={12} color="#2563eb" />
                  <Text style={{ fontSize: 12, fontWeight: "600", color: "#2563eb" }} numberOfLines={1}>
                    {item.groupName}
                  </Text>
                </View>
              ) : null}

              <View style={ui.row}>
                <Ionicons name="time-outline" size={12} color={colors.sub} />
                <Text style={text.sub}>{fmtDate(item.createdAt)}</Text>
              </View>
            </View>
          </View>

          {pressable ? <Ionicons name="chevron-forward" size={18} color="#c7c7c7" /> : null}
        </TouchableOpacity>
      );
    },
    [nav]
  );

  const onEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <View style={ui.center}>
        <ActivityIndicator size="large" />
        <Text style={text.sub}>Đang tải hoạt động…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={ui.center}>
        <Ionicons name="warning-outline" size={26} color={colors.danger} />
        <Text style={[text.body, { color: colors.danger, fontWeight: "600", marginTop: 6 }]}>
          Không tải được hoạt động
        </Text>
        <TouchableOpacity onPress={() => refetch()} style={[ui.btnSecondary, { marginTop: spacing.sm }]}>
          <Text style={ui.btnSecondaryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={ui.screen}>
      <FlatList
        data={items}
        keyExtractor={keyExtractor}
        renderItem={renderRow}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.4}
        refreshing={!!isRefetching}
        onRefresh={refetch}
        ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ margin: 10 }} /> : null}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60, gap: 6 }}>
            <Ionicons name="albums-outline" size={28} color="#9AA0A6" />
            <Text style={[text.body, { fontWeight: "700" }]}>Chưa có hoạt động</Text>
            <Text style={text.sub}>Các thay đổi gần đây sẽ xuất hiện tại đây</Text>
          </View>
        }
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}
