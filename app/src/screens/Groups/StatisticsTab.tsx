// app/src/screens/Groups/Tabs/StatisticsTab.tsx
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import PieChart from "react-native-pie-chart";
import { ui, text, colors, spacing } from "../../../src/styles/style";

import { useGroupBalances } from "../../api/hooks"; // 👈 Chuyển hook vào đây

// (Dán component GroupStatistics bạn đã tạo ở trên vào đây)
const GroupStatistics = ({ g, nameOf }: { g: any; nameOf: (id: number) => string }) => {
  const fmtMoney = (n: number) => n.toLocaleString("vi-VN");

  // Tính toán tổng chi và chi tiêu của từng thành viên
  const { totalSpent, pieData } = React.useMemo(() => {
    let total = 0;
    const byMember: Record<number, number> = {};

    g.recentExpenses?.forEach((exp: any) => {
      total += exp.amount;
      const payerId = exp.paidById;
      byMember[payerId] = (byMember[payerId] || 0) + exp.amount;
    });

    const memberIds = Object.keys(byMember).map(Number);
    
    // Bảng màu
    const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40', '#E7E9ED', '#8B0000', '#006400', '#00008B'];
    const getColor = (id: number) => COLORS[id % COLORS.length];
    
    // ✅ SỬA LỖI: Tạo mảng `series` theo cấu trúc mới { value, color }
    const series = memberIds.map(id => ({
      value: byMember[id],
      color: getColor(id),
    }));

    return {
      totalSpent: total,
      pieData: {
        series,     // 👈 Đây là Slice[]
        memberIds,  // 👈 Dùng cho phần chú thích
      },
    };
  }, [g.recentExpenses]);

  if (g.recentExpenses?.length === 0 || pieData.series.length === 0) {
    return null; // Không hiển thị gì nếu chưa có chi tiêu
  }

  return (
    <View style={{ marginTop: spacing.md }}>
      <Text style={text.h2}>Thống kê chi tiêu</Text>
      
      {/* Box tổng chi tiêu */}
      <View style={styles.statBox}>
        <Text style={styles.statLabel}>Tổng chi tiêu của nhóm</Text>
        <Text style={styles.totalAmount}>
          {fmtMoney(totalSpent)} {g.recentExpenses[0]?.currencyCode || 'VND'}
        </Text>
      </View>

      {/* Biểu đồ và chú thích */}
      <View style={styles.chartContainer}>
        <View style={{ flex: 1.2, alignItems: 'center', justifyContent: 'center' }}>
          <PieChart
            widthAndHeight={130}
            series={pieData.series} // 👈 Truyền Slice[]
          />
        </View>
        <View style={{ flex: 1.8, paddingLeft: spacing.md }}>
          <Text style={styles.legendTitle}>Thành viên đã trả:</Text>
          
          {/* ✅ SỬA LỖI: Cập nhật logic của Chú thích (Legend) */}
          {pieData.series.map((slice, index) => {
            const id = pieData.memberIds[index];
            const name = nameOf(id);
            const percentage = totalSpent > 0 ? ((slice.value / totalSpent) * 100).toFixed(0) : 0;

            return (
              <View key={id} style={styles.legendRow}>
                <View style={[styles.legendColor, { backgroundColor: slice.color }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.legendText} numberOfLines={1}>{name}</Text>
                  <Text style={styles.legendAmount} numberOfLines={1}>
                    {fmtMoney(slice.value)}
                  </Text>
                </View>
                <Text style={styles.legendPercent}>
                  {percentage}%
                </Text>
              </View>
            )
          })}
        </View>
      </View>
    </View>
  );
};

export function StatisticsTab({ group, nameOf, groupId }: { group: any; nameOf: (id: number) => string; groupId: number }) {
  const { data: balances } = useGroupBalances(groupId, { enabled: !!groupId });
  const fmtMoney = (n: number) => n.toLocaleString('vi-VN');

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      {/* 1. Component Thống kê (Biểu đồ) */}
      <GroupStatistics g={group} nameOf={nameOf} />

      {/* 2. Công nợ */}
      <Text style={[text.h2, { marginTop: spacing.md }]}>Công nợ</Text>
      {balances && balances.length > 0 ? (
        balances.map((it, i) => (
          <View key={`${it.fromUserId}-${it.toUserId}-${i}`} style={styles.rowCard}>
            <View style={styles.rowLeftIcon}>
              <Ionicons name="swap-horizontal-outline" size={16} color={colors.success} />
            </View>
            <Text style={{ flex: 1 }}>
              {nameOf(it.fromUserId)} nợ {nameOf(it.toUserId)}
            </Text>
            <Text style={{ fontWeight: '700' }}>{fmtMoney(it.amount)}</Text>
          </View>
        ))
      ) : (
        <View style={styles.emptyCard}>
          <Ionicons name="checkmark-done-outline" size={18} color="#9AA0A6" />
          <Text style={styles.emptyText}>Chưa có công nợ.</Text>
        </View>
      )}
    </ScrollView>
  );
}

// Thêm style cho tab này
const styles = StyleSheet.create({
  scrollContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
   rowCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
  rowLeftIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: colors.successBg ?? "#E8F5E9",
    alignItems: "center", justifyContent: "center",
  },
  emptyCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  emptyText: { color: colors.sub },
  expenseCard: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },

  statBox: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  statLabel: {
    color: colors.sub,
    fontSize: 14,
  },
  totalAmount: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 4,
  },
  chartContainer: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: spacing.md,
    marginTop: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendTitle: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
    fontSize: 14,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  legendColor: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: spacing.sm,
  },
  legendText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '500',
    flexShrink: 1,
  },
  legendAmount: {
    color: colors.sub,
    fontSize: 12,
  },
  legendPercent: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    marginLeft: spacing.sm,
  }

});