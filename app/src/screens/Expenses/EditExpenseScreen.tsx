// app/src/screens/EditExpenseScreen.tsx
import React from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useUpdateExpense } from '../../api/hooks'; // Dùng lại hook
import { ui} from "../../../src/styles/style";

export default function EditExpenseScreen() {
  const route = useRoute<any>();
  const nav = useNavigation();
  
  // Lấy dữ liệu chi tiêu đã được gửi qua
  const expense = route.params?.expense;
  
  const update = useUpdateExpense(expense.id);

  // Dùng lại toàn bộ logic form từ code cũ
  const [form, setForm] = React.useState<any>(() => ({
    title: expense.title,
    amount: String(expense.amount),
    currencyCode: expense.currencyCode,
    paidById: expense.paidById,
    splitMode: expense.splitMode,
    participants: expense.participants.map((p:any)=>({ userId: p.userId, share: p.share })),
  }));

  const onSave = async () => {
    try {
      const payload = {
        ...form,
        amount: parseFloat(form.amount),
      };
      await update.mutateAsync(payload);
      nav.goBack(); // Quay lại màn hình chi tiết
      Alert.alert("Thành công", "Đã cập nhật chi tiêu");
    } catch(e:any) {
      Alert.alert("Lỗi", e?.message || "Không lưu được chỉnh sửa");
    }
  };

  return (
    <View style={{ padding: 16, gap: 8 }}>
      <Text>Chỉnh sửa chi tiêu</Text>
      <TextInput 
        value={form.title} 
        onChangeText={t => setForm({...form, title: t})}
        placeholder="Tiêu đề" 
        style={ui.input}
      />
      <TextInput 
        value={form.amount} 
        onChangeText={t => setForm({...form, amount: t})}
        placeholder="Số tiền" 
        keyboardType="decimal-pad"
        style={ui.input}
      />
      
      {/* TODO: Thêm các ô input khác cho currency, paidBy... */}

      <TouchableOpacity onPress={onSave} style={ui.btnPrimary} disabled={update.isPending}>
        {update.isPending 
          ? <ActivityIndicator color="#fff" />
          : <Text style={ui.btnPrimaryText}>Lưu</Text>
        }
      </TouchableOpacity>
    </View>
  );
}