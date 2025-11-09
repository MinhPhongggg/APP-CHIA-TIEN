import React from "react";
import {
  View, Text, TextInput, TouchableOpacity, Alert,
  FlatList, Modal, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useGroupDetail, useAddMember, useDeleteGroup } from "../../api/hooks";
import { useUpdateGroup, useUserSearch } from "../../api/hooks";

type GroupType = "GENERAL" | "TRIP" | "HOME" | "COUPLE";

export default function GroupSettingsScreen(){
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const id = route.params?.id as number;

  const { data:g, isLoading, error } = useGroupDetail(id);
  const update = useUpdateGroup(id);
  const del = useDeleteGroup();
  const add = useAddMember(id);

  const [name, setName] = React.useState("");
  const [type, setType] = React.useState<GroupType>("GENERAL");
  const [destination, setDestination] = React.useState("");
  const [defaultCurrency, setDefaultCurrency] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [startDate, setStartDate] = React.useState<string | undefined>(undefined);
  const [endDate, setEndDate] = React.useState<string | undefined>(undefined);

  const [showModal, setShowModal] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [debounced, setDebounced] = React.useState(query);
  React.useEffect(() => {
    const t = setTimeout(()=> setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);
  const { data:suggestions, isFetching } = useUserSearch(debounced);

  React.useEffect(() => {
    if (!g) return;
    setName(g.name);
    setType(g.type as GroupType);
    setDestination(g.destination ?? "");
    setDefaultCurrency(g.defaultCurrency ?? "");
    setStartDate(g.startDate ?? undefined);
    setEndDate(g.endDate ?? undefined);
  }, [g]);

  if (isLoading) return <Text style={{margin:16}}>Đang tải...</Text>;
  if (error) return <Text style={{margin:16,color:"red"}}>Lỗi tải nhóm</Text>;
  if (!g) return null;

  async function onSave() {
    try {
      if (type === "TRIP" && (!startDate || !endDate)) {
        Alert.alert("Thiếu ngày", "Trip cần ngày bắt đầu/kết thúc (yyyy-MM-dd)");
        return;
      }
      await update.mutateAsync({
        name,
        type,
        destination: destination || null,
        defaultCurrency: defaultCurrency || null,
        notes: notes || null,
        startDate: type==="TRIP" ? startDate : null,
        endDate:   type==="TRIP" ? endDate   : null,
      });
      Alert.alert("Đã lưu thay đổi");
    } catch (e:any) {
      Alert.alert("Lỗi", e?.response?.data?.message ?? "Không lưu được");
    }
  }

  function askDelete(){
    Alert.alert("Xóa nhóm", "Thao tác không thể hoàn tác", [
      {text:"Hủy", style:"cancel"},
      {text:"Xóa", style:"destructive", onPress: doDelete}
    ]);
  }
  async function doDelete(){
    try {
      await del.mutateAsync(id);
      Alert.alert("Đã xóa nhóm");
      nav.reset({
        index: 0,
        routes: [
          {
            name: 'Main', 
            state: {
              routes: [{ name: 'GroupsTab' }], 
            },
          },
        ],
      });
      
    } catch(e:any){
      Alert.alert("Lỗi", e?.response?.data?.message ?? "Không thể xóa nhóm");
    }
  }

  async function handleAddByUserId(userId:number){
    try {
      await add.mutateAsync({ userId });
      Alert.alert("OK", "Đã thêm thành viên");
      setShowModal(false); setQuery("");
    } catch(e:any){
      Alert.alert("Lỗi", e?.response?.data?.message ?? "Không thêm được");
    }
  }

  const isOwner = g.members?.some(m => m.role === "OWNER");

  return (
    <KeyboardAvoidingView
      style={{ flex:1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
      keyboardVerticalOffset={Platform.select({ ios: 64, android: 0 }) as number}
    >
      

      {/* Nội dung cuộn được */}
      <ScrollView
        style={{ flex:1 }}
        contentContainerStyle={{ padding:16, paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        
        <Text style={{ fontWeight:"700" }}>Tên nhóm</Text>
        <TextInput value={name} onChangeText={setName}
          style={{ borderWidth:1, borderColor:"#ddd", borderRadius:8, padding:10, marginTop:6, marginBottom:12 }} />

        <Text style={{ fontWeight:"700" }}>Loại nhóm</Text>
        <View style={{ flexDirection:"row", flexWrap:"wrap", gap:8, marginTop:8, marginBottom:12 }}>
          {(["GENERAL","TRIP","HOME","COUPLE"] as GroupType[]).map(t => (
            <TouchableOpacity key={t} onPress={()=>setType(t)}
              style={{ paddingVertical:8, paddingHorizontal:12, borderRadius:16,
                       borderWidth:1, borderColor: type===t ? "#007AFF" : "#ddd",
                       backgroundColor: type===t ? "#E6F0FF" : "#fff" }}>
              <Text style={{ color: type===t ? "#007AFF" : "#333" }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {type === "TRIP" && (
          <>
            <Text style={{ fontWeight:"700" }}>Ngày bắt đầu (yyyy-MM-dd)</Text>
            <TextInput value={startDate} onChangeText={setStartDate}
              placeholder="2025-10-01"
              style={{ borderWidth:1, borderColor:"#ddd", borderRadius:8, padding:10, marginTop:6, marginBottom:12 }} />
            <Text style={{ fontWeight:"700" }}>Ngày kết thúc (yyyy-MM-dd)</Text>
            <TextInput value={endDate} onChangeText={setEndDate}
              placeholder="2025-10-05"
              style={{ borderWidth:1, borderColor:"#ddd", borderRadius:8, padding:10, marginTop:6, marginBottom:12 }} />
          </>
        )}

        <Text style={{ fontWeight:"700" }}>Điểm đến</Text>
        <TextInput value={destination} onChangeText={setDestination}
          style={{ borderWidth:1, borderColor:"#ddd", borderRadius:8, padding:10, marginTop:6, marginBottom:12 }} />

        <Text style={{ fontWeight:"700" }}>Tiền tệ mặc định</Text>
        <TextInput value={defaultCurrency} onChangeText={setDefaultCurrency} placeholder="VND, USD…"
          style={{ borderWidth:1, borderColor:"#ddd", borderRadius:8, padding:10, marginTop:6, marginBottom:12 }} />

        <Text style={{ fontWeight:"700" }}>Ghi chú</Text>
        <TextInput value={notes} onChangeText={setNotes}
          style={{ borderWidth:1, borderColor:"#ddd", borderRadius:8, padding:10, marginTop:6, marginBottom:12 }} />

        <TouchableOpacity onPress={onSave}
          style={{ backgroundColor:"#16a34a", padding:12, borderRadius:8, alignItems:"center", marginTop:4 }}>
          <Text style={{ color:"#fff", fontWeight:"700" }}>{update.isPending ? "Đang lưu..." : "Lưu thay đổi"}</Text>
        </TouchableOpacity>

        {/* Members */}
        <View style={{ height:1, backgroundColor:"#eee", marginVertical:16 }} />
        <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center" }}>
          <Text style={{ fontSize:16, fontWeight:"700" }}>Thành viên</Text>
          <TouchableOpacity onPress={()=> setShowModal(true)}>
            <Text style={{ color:"#007AFF" }}>+ Thêm</Text>
          </TouchableOpacity>
        </View>

        {/* Tránh nested scroll: tắt scroll của FlatList để ScrollView cuộn */}
        <FlatList
          scrollEnabled={false}
          style={{ marginTop:8 }}
          data={g.members}
          keyExtractor={(m)=>String(m.userId)}
          renderItem={({item})=>(
            <View style={{ paddingVertical:10, borderBottomWidth:1, borderColor:"#eee", flexDirection:"row", justifyContent:"space-between" }}>
              <Text>{item.displayName}  <Text style={{color:"#888"}}>({item.role})</Text></Text>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color:"#666", paddingVertical:10 }}>Chưa có thành viên.</Text>}
        />

        {/* Danger zone */}
        {isOwner && (
          <>
            <View style={{ height:1, backgroundColor:"#eee", marginVertical:16 }} />
            <TouchableOpacity onPress={askDelete}
              style={{ padding:12, borderRadius:8, borderWidth:1, borderColor:"#ef4444", alignItems:"center" }}>
              <Text style={{ color:"#ef4444", fontWeight:"700" }}>Xóa nhóm</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* Modal thêm thành viên (scroll riêng trong modal) */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={{ flex:1, backgroundColor:"rgba(0,0,0,0.25)", justifyContent:"center", padding:20 }}>
          <View style={{ backgroundColor:"#fff", borderRadius:12, padding:16, maxHeight:"80%" }}>
            <Text style={{ fontSize:16, fontWeight:"700" }}>Thêm thành viên</Text>
            <Text style={{ color:"#555", marginTop:6 }}>Nhập email hoặc tên để tìm</Text>

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="vd: alice@demo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              style={{ borderWidth:1, borderColor:"#ddd", borderRadius:8, padding:10, marginTop:10 }}
            />

            {isFetching ? (
              <ActivityIndicator style={{ marginTop:12 }} />
            ) : (
              <FlatList
                nestedScrollEnabled
                style={{ marginTop:10, maxHeight:260 }}
                data={suggestions ?? []}
                keyExtractor={(u)=>String(u.id)}
                ListEmptyComponent={
                  debounced?.length >= 2
                    ? <Text style={{ color:"#999", padding:8 }}>Không tìm thấy người dùng</Text>
                    : <Text style={{ color:"#999", padding:8 }}>Nhập ≥ 2 ký tự để tìm</Text>
                }
                renderItem={({item})=>(
                  <TouchableOpacity
                    onPress={()=> handleAddByUserId(item.id)}
                    style={{ paddingVertical:10, borderBottomWidth:1, borderColor:"#eee" }}
                  >
                    <Text style={{ fontWeight:"600" }}>{item.displayName}</Text>
                    <Text style={{ color:"#666", fontSize:12 }}>{item.email}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <View style={{ flexDirection:"row", justifyContent:"flex-end", marginTop:12, gap:12 }}>
              <TouchableOpacity onPress={()=> setShowModal(false)}>
                <Text style={{ color:"#666" }}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}
