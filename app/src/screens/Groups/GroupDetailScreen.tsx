
// app/src/screens/Groups/GroupDetailScreen.tsx
import React from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet, ImageBackground } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'; // 👈 Import

// ✅ style chung
import { ui, text, colors, spacing } from '../../../src/styles/style';

// ✅ hooks (chỉ giữ lại những hook dùng chung)
import { useGroupDetail, useDeleteGroup, useUploadGroupImage } from '../../api/hooks';
import { resolveImageUrl } from '../../api/groups';
import * as ImagePicker from 'expo-image-picker';

// ✅ Import 3 màn hình Tab
import { ExpensesTab } from '../Groups/ExpensesTab';
import { StatisticsTab } from '../Groups/StatisticsTab';
import { MembersTab } from '../Groups/MembersTab';

// Tạo Tab navigator
const Tab = createMaterialTopTabNavigator();

// ----- Component Header (Chỉ chứa ảnh bìa) -----
// Đây là phần sẽ KHÔNG cuộn, luôn ở trên cùng
const GroupHeader = ({ g, onUpload, uploadPending }: { g: any; onUpload: () => void; uploadPending: boolean }) => {
  const nav = useNavigation<any>();
  return (
    <View style={{ padding: 16, backgroundColor: colors.bg }}>
      <ImageBackground
        source={
          g.imageUrl
            ? { uri: resolveImageUrl(g.imageUrl) }
            : require('../../../../assets/avatar-placeholder.png')
        }
        imageStyle={{ borderRadius: 16 }}
        style={styles.imageBackground}
      >
        
        <View style={styles.imageOverlay} />
        
        {/* Nút Đổi ảnh */}
        <TouchableOpacity
          onPress={onUpload}
          style={getHeaderButtonStyle(true)} // true = right
          disabled={uploadPending}
        >
          <Ionicons name="camera-outline" size={16} color="#fff" />
          <Text style={styles.headerButtonText}>
            {uploadPending ? 'Đang tải...' : ''}
          </Text>
        </TouchableOpacity>
        

        {/* Nút Cài đặt */}
        <TouchableOpacity
          onPress={() => nav.navigate('GroupSettings', { id: g.id })}
          style={getHeaderButtonStyle(false)} // false = left
        >
          <Ionicons name="settings-outline" size={18} color="#fff" />
        </TouchableOpacity>

        {/* Tiêu đề nhóm */}
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{g.name}</Text>
          <Text style={styles.headerSubtitle}>
            {g.type}{g.destination ? ` • ${g.destination}` : ''}
            {g.startDate ? ` • ${g.startDate} → ${g.endDate}` : ''}
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
};


// ----- Component màn hình chính -----
export default function GroupDetailScreen() {
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const id = route.params?.id as number | undefined;

  // 1. Hooks chính
  const { data, isLoading, isError } = useGroupDetail(id, { enabled: !!id });
  // (useDeleteGroup sẽ được dùng trong GroupSettings, tạm thời để đây)
  // const del = useDeleteGroup(); 
  const upload = useUploadGroupImage(id!);

  // 2. Logic & State (chỉ giữ lại những gì thuộc về header)
  if (!id) return <Text style={styles.error}>Thiếu group id</Text>;
  if (isLoading) {
    return (
      <View style={ui.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.muted}>Đang tải nhóm…</Text>
      </View>
    );
  }
  if (isError) return <Text style={styles.error}>Lỗi tải nhóm</Text>;
  const g = data!;

  // Hàm helper
  const idToName: Record<number, string> = {};
  g?.members?.forEach((u: any) => { idToName[u.userId] = u.displayName; });
  const nameOf = (uid: number) => idToName[uid] ?? `U${uid}`;

  // Logic đổi ảnh
  async function changeImage() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (perm.status !== "granted") {
      Alert.alert("Thiếu quyền truy cập ảnh");
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (res.canceled) return;
    await upload.mutateAsync(res.assets[0].uri);
    Alert.alert("Thành công", "Ảnh nhóm đã được cập nhật!");

  }
  
  // 3. Render giao diện
  return (
    <View style={ui.screen}>
      {/* 1. HEADER (Cố định) */}
      <GroupHeader g={g} onUpload={changeImage} uploadPending={upload.isPending} />

      {/* 2. TAB NAVIGATOR (Nội dung chính) */}
      <Tab.Navigator
        screenOptions={{
            tabBarActiveTintColor: colors.primary, 
            tabBarInactiveTintColor: colors.sub,   
            tabBarIndicatorStyle: { backgroundColor: colors.primary },
            tabBarStyle: { backgroundColor: colors.bg, elevation: 0, shadowOpacity: 0, height: 50, },
            tabBarShowLabel: true, 
            
        }}
      >
        <Tab.Screen name="Chi tiêu" options={{ tabBarLabel: 'Chi tiêu' }}>
          {() => <ExpensesTab group={g} nameOf={nameOf} groupId={id} />}
        </Tab.Screen>
        <Tab.Screen name="Thống kê" options={{ tabBarLabel: 'Thống kê' }}>
          {() => <StatisticsTab group={g} nameOf={nameOf} groupId={id} />}
        </Tab.Screen>
        <Tab.Screen name="Thành viên" options={{ tabBarLabel: 'Thành viên' }}>
          {() => <MembersTab group={g} nameOf={nameOf} groupId={id} />}
        </Tab.Screen>
      </Tab.Navigator>
    </View>
  );
}


/* -------------------- Helper function -------------------- */
const getHeaderButtonStyle = (isRight: boolean) => ({
  position: 'absolute' as const,
  top: 10,
  ...(isRight ? { right: 10 } : { left: 10 }),
  backgroundColor: 'rgba(0,0,0,0.5)',
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 999,
  flexDirection: 'row' as const,
  alignItems: 'center' as const,
});

/* -------------------- Local styles (cho GroupDetailScreen) -------------------- */
const styles = StyleSheet.create({
  error: { margin: spacing.lg, color: 'red' },
  muted: { color: colors.sub, marginTop: 6 },
  imageBackground: {
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    padding: 14,
    backgroundColor: '#eee',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 16,
  },
  headerButtonText: { color: '#fff', marginLeft: 6, fontSize: 13 },
  headerTitleContainer: {
    paddingTop: spacing.sm, // Thêm chút đệm
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  headerSubtitle: { color: '#f1f5f9', marginTop: 4, opacity: 0.9 },
});