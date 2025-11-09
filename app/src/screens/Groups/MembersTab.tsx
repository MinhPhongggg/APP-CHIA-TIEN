// app/src/screens/Groups/Tabs/MembersTab.tsx
import React from 'react';
import { 
  View, FlatList, Text, TouchableOpacity, Modal, TextInput, 
  ActivityIndicator, StyleSheet, Alert, 
  KeyboardAvoidingView, Platform // ✅ Thêm
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ui, text, colors, spacing, radius } from "../../../src/styles/style";
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // ✅ Thêm

import { useAddMember, useUserSearch } from '../../api/hooks';

export function MembersTab({ group, nameOf, groupId }: { group: any; nameOf: (id: number) => string; groupId: number }) {
  const add = useAddMember(groupId ?? 0);
  const insets = useSafeAreaInsets(); // ✅ Lấy vùng an toàn (tai thỏ, home bar)

  const [showModal, setShowModal] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [debounced, setDebounced] = React.useState(query);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const { data: suggestions, isFetching } = useUserSearch(debounced, { enabled: showModal });

  // ✅ Logic: Tạo 1 Set chứa ID thành viên đã có để lọc
  const existingMemberIds = React.useMemo(() => 
    new Set(group.members.map((m: any) => m.userId)), 
    [group.members]
  );

  // ✅ Logic: Lọc những người đã có trong nhóm ra khỏi danh sách gợi ý
  const filteredSuggestions = suggestions?.filter(
    (u: any) => !existingMemberIds.has(u.id)
  );

  async function handleAddByUserId(userId: number) {
    try {
      await add.mutateAsync({ userId });
      Alert.alert('OK', 'Đã thêm thành viên');
      // Không đóng modal, chỉ xóa query để họ có thể thêm người khác
      setQuery(''); 
    } catch (e: any) {
      Alert.alert('Lỗi', e?.response?.data?.message ?? 'Không thêm được');
    }
  }

  // ✅ Hàm đóng modal và reset state
  function closeModal() {
    setShowModal(false);
    setQuery('');
  }

  return (
    <View style={styles.tabContainer}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={group.members}
        keyExtractor={(m) => String(m.userId)}
        renderItem={({ item }) => (
          <View style={[ui.card, styles.memberCard]}>
            <Ionicons name="person-circle-outline" size={32} color={colors.success} />
            <View style={{ marginLeft: spacing.sm }}>
              <Text style={{ fontWeight: '600', color: colors.text, fontSize: 15 }}>{item.displayName}</Text>
              <Text style={{ color: colors.sub, fontSize: 13, textTransform: 'capitalize' }}>{item.role.toLowerCase()}</Text>
            </View>
          </View>
        )}
        ListHeaderComponent={
          <TouchableOpacity onPress={() => setShowModal(true)} style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={18} color={colors.primary} />
            <Text style={text.link}> Thêm thành viên</Text>
          </TouchableOpacity>
        }
        ListEmptyComponent={<Text style={styles.muted}>Chưa có thành viên</Text>}
      />

      {/* Modal thêm thành viên */}
      <Modal visible={showModal} transparent animationType="slide" onRequestClose={closeModal}>
        {/* ✅ Dùng KeyboardAvoidingView để modal né bàn phím */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          {/* ✅ Lớp phủ mờ, bấm vào sẽ đóng modal */}
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={closeModal}
          />
        
          {/* ✅ Thẻ nội dung trượt từ dưới lên */}
          <View style={[styles.modalCard, { paddingBottom: insets.bottom + spacing.sm }]}>
            <Text style={styles.modalTitle}>Thêm thành viên</Text>
            <Text style={styles.modalHint}>Nhập email hoặc tên để tìm</Text>
            
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="vd: alice@demo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              style={[ui.input, { marginTop: spacing.sm }]} // Cập nhật style
              autoFocus={true} // ✅ Tự động focus vào ô input
            />
            
            {isFetching ? (
              <ActivityIndicator style={{ marginTop: spacing.md, height: 240 }} /> // Thêm chiều cao
            ) : (
              <FlatList
                style={{ maxHeight: 240, marginTop: spacing.sm }} // Giữ nguyên
                data={filteredSuggestions ?? []} // ✅ Dùng list đã lọc
                keyExtractor={(u) => String(u.id)}
                ListEmptyComponent={
                  debounced.trim().length >= 2 ? (
                    <Text style={styles.muted}>Không tìm thấy người dùng</Text>
                  ) : (
                    <Text style={styles.muted}>Nhập ≥ 2 ký tự để tìm</Text>
                  )
                }
                renderItem={({ item }) => (
                  // ✅ Cải thiện UI item
                  <TouchableOpacity onPress={() => handleAddByUserId(item.id)} style={styles.modalItem}>
                    <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
                    <View style={{ marginLeft: spacing.sm }}>
                      <Text style={{ fontWeight: "600" }}>{item.displayName}</Text>
                      <Text style={{ color: colors.sub, fontSize: 12 }}>{item.email}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
            
            {/* ✅ Nút Đóng giờ rõ ràng hơn */}
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Đóng</Text>
            </TouchableOpacity>

          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

// Thêm style cho tab này
const styles = StyleSheet.create({
  tabContainer: { flex: 1, backgroundColor: '#f7f7f7' },
  listContent: { padding: spacing.lg, paddingBottom: spacing.xxl },
  memberCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // 'gap' có thể không hoạt động trên RN cũ, nhưng 'marginLeft' trong code thì OK
    marginBottom: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  addButton: {
    ...ui.row,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderRadius: 12,
    marginBottom: spacing.md,
    justifyContent: 'center',
  },
  muted: { color: colors.sub, marginTop: 12, textAlign: 'center' }, // Sửa
  
  // ----- ✅ Style Modal đã được làm lại -----
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)", // Đậm hơn 1 chút
    justifyContent: "flex-end", // Đẩy modal xuống dưới
  },
  modalCard: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 16, // Bo tròn 2 góc trên
    borderTopRightRadius: 16,
    padding: spacing.md,
    paddingTop: spacing.lg,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: colors.text, textAlign: 'center' },
  modalHint: { color: colors.sub, marginTop: 4, textAlign: 'center' },
  modalItem: {
    flexDirection: 'row', // ✅ Cải thiện UI
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  closeButton: { // ✅ Nút đóng mới
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  }
});