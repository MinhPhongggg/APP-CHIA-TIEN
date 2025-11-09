import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PaymentListScreen from "../../screens/Payments/PaymentListScreen";
import AddPaymentScreen from "../../screens/Payments/AddPaymentScreen";

const Stack = createNativeStackNavigator();
export default function PaymentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="PaymentsHome" component={PaymentListScreen} />
      <Stack.Screen name="AddPayment" component={AddPaymentScreen}/>
    </Stack.Navigator>
  );
}
