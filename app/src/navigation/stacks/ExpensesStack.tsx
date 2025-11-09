import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import BalanceScreen from "../../screens/Balances/BalanceScreen";
import UserBalancesScreen from "../../screens/Balances/UserBalancesScreen";

const Stack = createNativeStackNavigator();
export default function ExpensesStack(){
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="ExpensesHome" component={BalanceScreen} />
      <Stack.Screen name="UserBalances" component={UserBalancesScreen} />
    </Stack.Navigator>
  );
}
