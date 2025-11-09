// app/src/screens/Balances/BalanceScreen.tsx
import React from "react";
import { View, Text, TouchableOpacity, SectionList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useBalancesSummary } from "../../api/hooks";
import { ui, text, colors, spacing } from "../../../src/styles/style"; // 👈 chỉnh path nếu khác

type Item = { userId: number; displayName: string; email: string; net: number };
type Section = { title: string; key: "oweMe" | "iOwe"; data: Item[]; empty: string };

export default function BalanceScreen() {
  const nav = useNavigation<any>();

  // ✅ CHỈ 1 HOOK, gọi ở top-level
  const { data, isLoading, isError, refetch, isRefetching } = useBalancesSummary();

  if (isLoading) {
    return (
      <View style={ui.center}>
        <Ionicons name="wallet-outline" size={26} color={colors.primary} />
        <Text style={text.sub}>Đang tải số dư…</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={ui.center}>
        <Ionicons name="warning-outline" size={26} color={colors.danger} />
        <Text style={[text.body, { color: colors.danger, fontWeight: "600", marginTop: 6 }]}>
          Lỗi tải số dư
        </Text>
        <TouchableOpacity onPress={() => refetch()} style={[ui.btnSecondary, { marginTop: spacing.sm }]}>
          <Text style={ui.btnSecondaryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const items: Item[] = data?.items ?? [];
  const oweMe = items.filter(i => i.net > 0).sort((a, b) => b.net - a.net);
  const iOwe  = items.filter(i => i.net < 0).sort((a, b) => a.net - b.net);

  const sections: Section[] = [
    { title: "Người khác nợ mình", key: "oweMe", data: oweMe, empty: "Không ai nợ bạn" },
    { title: "Mình nợ người khác", key: "iOwe",  data: iOwe,  empty: "Bạn không nợ ai" },
  ];

  const fmt = (n: number) =>
    n.toLocaleString("vi-VN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const renderItem = ({ item }: { item: Item }) => {
    const positive = item.net > 0;
    return (
      <TouchableOpacity
        onPress={() => nav.navigate("UserBalances", { userId: item.userId })}
        style={[ui.rowCard, { gap: 12 }]}
        activeOpacity={0.85}
      >
        <View style={[ui.avatar, { width: 36, height: 36 }]}>
          <Ionicons name="person-outline" size={18} color={colors.success} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={[text.body, { fontWeight: "700" }]} numberOfLines={1}>
            {item.displayName}
          </Text>
          <Text style={[text.sub, { fontSize: 12 }]} numberOfLines={1}>
            {item.email}
          </Text>
        </View>

        <Text
          style={{
            fontWeight: "800",
            minWidth: 90,
            textAlign: "right",
            color: positive ? colors.success : colors.danger,
          }}
        >
          {positive ? `+${fmt(item.net)}` : fmt(item.net)}
        </Text>
        <Ionicons name="chevron-forward" size={18} color="#c7c7c7" />
      </TouchableOpacity>
    );
  };

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <View style={[{ paddingTop: 6, paddingBottom: 8 }]}>
      <Text style={text.h2}>{section.title}</Text>
    </View>
  );

  const renderSectionFooter = ({ section }: { section: Section }) =>
    section.data.length === 0 ? (
      <Text style={[text.sub, { marginBottom: 8 }]}>{section.empty}</Text>
    ) : null;

  return (
    // ✅ Giữ bottom safe-area, không đụng header Stack
    <SafeAreaView edges={["bottom"]} style={ui.screen}>
      <SectionList
        sections={sections}
        keyExtractor={(x: Item) => String(x.userId)}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        renderSectionFooter={renderSectionFooter}
        refreshing={!!isRefetching}
        onRefresh={refetch}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}
      />
    </SafeAreaView>
  );
}
