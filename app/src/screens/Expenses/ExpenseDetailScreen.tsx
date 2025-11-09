// app/src/screens/ExpenseDetailScreen.tsx

import React from "react";
import {
  View, Text, ActivityIndicator, TextInput, TouchableOpacity, FlatList,
  Alert, StyleSheet, KeyboardAvoidingView, Platform,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native"; // ✅ Thêm useNavigation
import { Ionicons } from "@expo/vector-icons"; // ✅ Thêm
import { useExpenseDetail, useExpenseComments, useAddExpenseComment } from "../../api/hooks"; // ⛔️ Xóa useUpdateExpense
import { ui, text, colors, spacing, radius } from "../../../src/styles/style";

// ---------------------------------------------------------------
// ✅ TÁCH COMPONENT: Phần Header (Hóa đơn) - GIAO DIỆN MỚI
// ---------------------------------------------------------------
const ExpenseReceipt = ({ exp }: { exp: any }) => {
  const fmtMoney = (n: number) => (n ?? 0).toLocaleString("vi-VN");

  return (
    // ✅ Thêm style "tờ hóa đơn"
    <View style={styles.receiptContainer}>
      
      {/* 1. Tiêu đề Hóa đơn */}
      <Text style={styles.receiptHeader}>CHI TIẾT THANH TOÁN</Text>
      
      {/* 2. Thông tin người trả */}
      <Text style={styles.receiptPayer}>
        Trả bởi: <Text style={{ fontWeight: '600' }}>{exp.paidByName}</Text>
      </Text>
      <Text style={styles.receiptPayer}>
        Ngày: {new Date(exp.createdAt).toLocaleDateString('vi-VN')}
      </Text>

      {/* 3. Tiêu đề chi tiêu */}
      <Text style={styles.receiptTitle}>{exp.title}</Text>
      
      {/* Đường kẻ ngang */}
      <View style={styles.receiptDivider} />

      {/* 4. Danh sách tham gia (như line items) */}
      <Text style={styles.receiptSectionTitle}>CHI TIẾT CHIA</Text>
      {exp.participants.map((p: any) => (
        <View key={p.id ?? p.userId} style={styles.receiptLineItem}>
          <Text style={styles.receiptItemName}>{p.displayName}</Text>
          <Text style={styles.receiptItemAmount}>{fmtMoney(p.amountOwed)}</Text>
        </View>
      ))}

      {/* 5. Tổng cộng */}
      <View style={styles.receiptTotalContainer}>
        <Text style={styles.receiptTotalLabel}>TỔNG CỘNG</Text>
        <Text style={styles.receiptTotalValue}>
          {fmtMoney(exp.amount)} {exp.currencyCode}
        </Text>
      </View>
    </View>
  );
};


// ---------------------------------------------------------------
// ✅ MÀN HÌNH CHÍNH
// ---------------------------------------------------------------
export default function ExpenseDetailScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>(); // ✅ Lấy navigation
  const id = route.params?.id as number;

  const { data: exp, isLoading } = useExpenseDetail(id);
  const { data: comments, isLoading: loadingCmt } = useExpenseComments(id);
  const addCmt = useAddExpenseComment(id);

  const [draft, setDraft] = React.useState("");
  
  // ⛔️ ĐÃ XÓA: state 'form', 'editing', 'onSave'

  // ✅ Thêm nút "Chỉnh sửa" lên header
  React.useLayoutEffect(() => {
    if (exp) {
      nav.setOptions({
        headerRight: () => (
          <TouchableOpacity 
            onPress={() => nav.navigate("EditExpense", { expense: exp })} // 👈 Điều hướng đến màn hình Edit
            style={{ paddingHorizontal: spacing.lg }}
          >
            <Ionicons name="pencil-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        ),
      });
    }
  }, [nav, exp]); // Phụ thuộc vào 'exp' để đảm bảo 'exp' không null


  if (isLoading || !exp) {
    return <View style={ui.center}><ActivityIndicator /></View>;
  }

  const onSend = async () => {
    const text = draft.trim();
    if (!text) return;
    try {
      await addCmt.mutateAsync(text);
      setDraft("");
    } catch (e: any) {
      Alert.alert("Lỗi", e?.message || "Không gửi được bình luận");
    }
  };
  
  // ⛔️ ĐÃ XÓA: Toàn bộ phần `!editing ? ... : ...`

  return (
    // ✅ Dùng KeyboardAvoidingView để ô chat không bị che
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={ui.screen}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0} // Tinh chỉnh
    >
      <FlatList
        data={comments}
        keyExtractor={(it: any) => String(it.id)}
        // ✅ Phần "Hóa đơn" là Header của FlatList
        ListHeaderComponent={<ExpenseReceipt exp={exp} />}
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <View style={styles.commentAvatar}>
              <Ionicons name="person-circle-outline" size={24} color={colors.sub} />
            </View>
            <View style={styles.commentBody}>
              <Text style={{ fontWeight: "600" }}>{item.authorName}</Text>
              <Text>{item.content}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyComment}>Chưa có bình luận</Text>
        }
        // ✅ Thêm đệm để không bị dính vào ô chat
        contentContainerStyle={{ paddingBottom: spacing.lg }} 
      />

      {/* Input comment (Đã được style lại) */}
      <View style={styles.inputContainer}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="Viết bình luận..."
          style={styles.textInput}
        />
        <TouchableOpacity onPress={onSend} style={styles.sendButton} disabled={addCmt.isPending}>
          {addCmt.isPending 
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="send" size={16} color="#fff" />
          }
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}


const styles = StyleSheet.create({
  // Hóa đơn
  receiptContainer: {
    backgroundColor: '#fdfdfd', 
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 1, 
    padding: spacing.lg,
    margin: spacing.lg,
    marginBottom: spacing.md,
  },
  receiptHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.sub,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  receiptPayer: {
    textAlign: 'center',
    color: colors.sub,
    fontSize: 13,
    marginBottom: 2,
  },
  receiptTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  receiptDivider: {
    height: 1,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    borderStyle: 'dashed',
    marginVertical: spacing.sm,
  },
  receiptSectionTitle: {
    fontWeight: 'bold',
    color: colors.sub,
    fontSize: 13,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  receiptLineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#f7f7f7',
  },
  receiptItemName: {
    fontSize: 15,
    color: colors.text,
  },
  receiptItemAmount: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    // Dùng font mono để số thẳng hàng (nếu có)
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  receiptTotalContainer: {
    marginTop: spacing.md,
    borderTopWidth: 2,
    borderTopColor: '#ccc',
    borderStyle: 'dashed',
    paddingTop: spacing.md,
  },
  receiptTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  receiptTotalValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    marginTop: spacing.xs,
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  payerInfo: {
    ...ui.row,
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  participantRow: {
    ...ui.between,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  // Bình luận
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  commentAvatar: {
    paddingTop: 2,
  },
  commentBody: {
    flex: 1,
  },
  emptyComment: {
    textAlign: 'center',
    color: colors.sub,
    marginTop: spacing.lg,
  },
  
  // Ô nhập bình luận
  inputContainer: {
    flexDirection: "row",
    gap: 8,
    padding: spacing.md,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.bg,
  },
  sendButton: {
    paddingHorizontal: spacing.md,
    justifyContent: "center",
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    width: 44,
    height: 44,
  },
});