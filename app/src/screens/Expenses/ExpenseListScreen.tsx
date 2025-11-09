// src/screens/Expenses/ExpenseListScreen.tsx
import React from "react"; import { View, Text, Button } from "react-native";
export default function ExpenseListScreen({ navigation }: any){
  return (
    <View style={{ flex:1, padding:16 }}>
      <Text style={{ fontSize:18, fontWeight:"600", marginBottom:8 }}>Danh sách chi phí</Text>
      <Button title="Thêm chi phí" onPress={()=>navigation.navigate("AddExpense")} />
    </View>
  );
}

