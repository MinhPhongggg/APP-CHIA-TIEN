// app/src/screens/Groups/Tabs/ExpensesTab.tsx
import React from "react";
import {
  View, FlatList, Text, TouchableOpacity, StyleSheet, Platform, Image
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { ui, text, colors, spacing } from "../../../src/styles/style";
import { resolveImageUrl } from '../../api/groups';
/* ========== Avatar Placeholder (giữ nguyên) ========== */
const AVATAR_COLORS = ["#FF6384","#36A2EB","#FFCE56","#4BC0C0","#9966FF","#FF9F40","#E7E9ED","#8B0000","#006400","#00008B","#556B2F","#FF8C00"];
const getInitials = (name: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
const getColor = (name: string) => {
  if (!name) return "#ccc";
  const hash = name.split("").reduce((acc, c) => c.charCodeAt(0) + ((acc << 5) - acc), 0);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
const AvatarPlaceholder = ({ name, size = 40 }: { name: string; size?: number }) => {
  const initials = getInitials(name);
  const bg = getColor(name);
  const textColor = bg === "#E7E9ED" ? "#666" : "#fff";
  return (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[styles.avatarText, { color: textColor }]}>{initials}</Text>
    </View>
  );
};

/* ========== NEW: Avatar hiển thị ảnh nếu có, fallback placeholder ========== */
const PayerAvatar = ({
  name,
  avatarUrl,
  size = 40,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
}) => {
  const uri = avatarUrl ? resolveImageUrl(avatarUrl) : null;
  if (!uri) return <AvatarPlaceholder name={name} size={size} />;
  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: "#eee", marginRight: spacing.sm }}
      resizeMode="cover"
      onError={() => {/* nếu lỗi ảnh, UI vẫn ổn vì chỉ không render ra ảnh */}}
    />
  );
};

/* ========== TAB CHÍNH ========== */
export function ExpensesTab({
  group,
  nameOf,
  groupId,
}: {
  group: any;
  nameOf: (id: number) => string;
  groupId: number;
}) {
  const nav = useNavigation<any>();

  // Map userId -> member (để tra avatar) — tạo mỗi render, không dùng hook
  const memberById: Record<number, any> = {};
  (group.members ?? []).forEach((m: any) => (memberById[m.userId] = m));

  return (
    <View style={styles.tabContainer}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={group.recentExpenses}
        keyExtractor={(e) => String(e.id)}
        renderItem={({ item }) => {
          const payer = memberById[item.paidById];
          const payerName = payer?.displayName ?? nameOf(item.paidById);
          const payerAvatar = payer?.avatarUrl as string | undefined;

          return (
            <TouchableOpacity
              onPress={() => nav.navigate("ExpenseDetail", { id: item.id })}
              activeOpacity={0.85}
            >
              <View style={styles.expenseCard}>
                {/* 1) Avatar người trả */}
                <PayerAvatar name={payerName} avatarUrl={payerAvatar} size={44} />

                {/* 2) Thông tin */}
                <View style={styles.expenseInfo}>
                  <Text style={styles.expenseTitle} numberOfLines={1}>
                    {item.title}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Ionicons name="wallet-outline" size={12} color={colors.sub} />
                    <Text style={styles.expensePayer} numberOfLines={1}>
                      {payerName} đã trả • {item.splitMode}
                    </Text>
                  </View>
                </View>

                {/* 3) Số tiền */}
                <View style={styles.expenseAmountContainer}>
                  <Text style={styles.expenseAmount} numberOfLines={1}>
                    {Number(item.amount).toLocaleString("vi-VN")}
                  </Text>
                  <Text style={styles.expenseCurrency}>{item.currencyCode}</Text>
                </View>

                {/* 4) Mũi tên */}
                <Ionicons name="chevron-forward" size={18} color="#c7c7c7" style={{ marginLeft: spacing.xs }} />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={18} color="#9AA0A6" />
            <Text style={styles.emptyText}>Chưa có chi tiêu nào.</Text>
          </View>
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => nav.navigate("AddExpense", { groupId, members: group.members })}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

/* ========== STYLES ========== */
const styles = StyleSheet.create({
  tabContainer: { flex: 1, backgroundColor: colors.bg },
  listContent: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: 80 },

  avatar: { alignItems: "center", justifyContent: "center", marginRight: spacing.sm },
  avatarText: {
    fontWeight: "bold",
    fontSize: 16,
    fontFamily: Platform.OS === "ios" ? "Helvetica-Bold" : "sans-serif-condensed",
  },

  expenseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    ...shadow(1),
  },
  expenseInfo: { flex: 1, marginRight: spacing.sm },
  expenseTitle: { fontWeight: "700", color: colors.text, fontSize: 15, marginBottom: 2 },
  expensePayer: { fontSize: 13, color: colors.sub },

  expenseAmountContainer: { alignItems: "flex-end" },
  expenseAmount: { fontWeight: "700", color: colors.text, fontSize: 15 },
  expenseCurrency: { color: colors.sub, fontSize: 12 },

  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    ...shadow(1),
  },
  emptyText: { color: colors.sub },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: colors.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    ...shadow(2),
  },
});

function shadow(elevation: number) {
  return {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: elevation },
    shadowOpacity: 0.1 + elevation * 0.05,
    shadowRadius: elevation * 1.5,
    elevation,
  };
}
