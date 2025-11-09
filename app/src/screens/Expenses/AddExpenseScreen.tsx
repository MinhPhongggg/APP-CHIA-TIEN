import React, { useMemo, useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useCreateExpense } from "../../api/hooks";
import { Picker } from "@react-native-picker/picker";
import type { SplitMode } from "../../api/groups";

export default function AddExpenseScreen(){
  const nav   = useNavigation<any>();
  const route = useRoute<any>();
  const groupId = route.params.groupId as number;
  const members = route.params.members as {userId:number; displayName:string}[];

  const create = useCreateExpense(groupId);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [currencyCode, setCC] = useState("VND");
  const [paidById, setPaidById] = useState<number>(members[0]?.userId);
  const [mode, setMode] = useState<SplitMode>("EQUAL");
  const [shares, setShares] = useState<Record<number,string>>(
    () => Object.fromEntries(members.map(m=>[m.userId,"1"])) // EQUAL: 1 mỗi người
  );

  const inputs = useMemo(()=>members.map(m=>({ ...m, value:shares[m.userId] ?? "" })), [members, shares]);
  const setShare = (uid:number,v:string)=> setShares(s=>({ ...s, [uid]: v }));

  async function onSubmit() {
    const amt = Number(amount);
    if (!title || !amt || !paidById) { Alert.alert("Lỗi","Nhập tiêu đề, số tiền, người trả"); return; }

    const participants = inputs.map(i => ({ userId: i.userId, share: Number(i.value || 0) }));

    if (mode === "PERCENT") {
      const sum = participants.reduce((s,p)=>s+p.share,0);
      if (Math.round(sum) !== 100) { Alert.alert("Lỗi","Tổng % phải = 100"); return; }
    }
    if (mode === "AMOUNT") {
      const sum = participants.reduce((s,p)=>s+p.share,0);
      if (Math.round(sum*100) !== Math.round(amt*100)) { Alert.alert("Lỗi","Tổng tiền con phải = tổng"); return; }
    }

    try {
      await create.mutateAsync({ title, amount: amt, currencyCode, paidById, splitMode: mode, participants });
      Alert.alert("OK","Đã thêm chi tiêu");
      nav.goBack();
    } catch (e:any) {
      Alert.alert("Lỗi", e?.response?.data?.message ?? "Không tạo được expense");
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding:16, gap:12 }}>
      <Text style={{ fontSize:18, fontWeight:"700" }}>Thêm chi tiêu</Text>

      <Text>Tiêu đề</Text>
      <TextInput value={title} onChangeText={setTitle} placeholder="Ăn tối"
        style={{borderWidth:1,borderColor:"#ddd",borderRadius:8,padding:10}} />

      <Text>Số tiền</Text>
      <TextInput value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="600000"
        style={{borderWidth:1,borderColor:"#ddd",borderRadius:8,padding:10}} />

      <Text>Người trả</Text>
      <Picker selectedValue={paidById} onValueChange={(v)=>setPaidById(v)}>
        {members.map(m => <Picker.Item key={m.userId} label={m.displayName} value={m.userId} />)}
      </Picker>

      <Text>Kiểu chia</Text>
      <Picker selectedValue={mode} onValueChange={(v)=>setMode(v)}>
        <Picker.Item label="Chia đều" value="EQUAL" />
        <Picker.Item label="Phần trăm (%)" value="PERCENT" />
        <Picker.Item label="Nhập số tiền" value="AMOUNT" />
        <Picker.Item label="Theo số phần (shares)" value="SHARE" />
      </Picker>

      <Text style={{marginTop:8, fontWeight:"700"}}>Thành viên & {mode==="EQUAL"?"tham gia? (1/0)":"giá trị"}</Text>
      {inputs.map(m=>(
        <View key={m.userId} style={{flexDirection:"row", alignItems:"center", gap:8, marginBottom:6}}>
          <Text style={{width:140}} numberOfLines={1}>{m.displayName}</Text>
          <TextInput
            style={{flex:1, borderWidth:1,borderColor:"#ddd",borderRadius:8,padding:8}}
            keyboardType="numeric"
            value={m.value}
            onChangeText={(v)=>setShare(m.userId, v)}
            placeholder={mode==="EQUAL" ? "1 = tham gia" :
                        mode==="PERCENT" ? "%" :
                        mode==="AMOUNT"  ? "số tiền" : "phần"}
          />
        </View>
      ))}

      <Button title={create.isPending ? "Đang lưu..." : "Lưu"} onPress={onSubmit} />
    </ScrollView>
  );
}
