// src/screens/Payments/PaymentListScreen.tsx
import React from "react"; import { View, Text, Button } from "react-native";
export default function PaymentListScreen({ navigation }: any){
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:18, fontWeight:"600", marginBottom:8 }}>Lịch sử thanh toán</Text>
      <Button title="Ghi nhận thanh toán" onPress={()=>navigation.navigate("AddPayment")} />
    </View>
  );
}

