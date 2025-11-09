import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import GroupListScreen from "../../screens/Groups/GroupListScreen";
import AddGroupScreen from "../../screens/Groups/AddGroupScreen";
import GroupDetailScreen from "../../screens/Groups/GroupDetailScreen";
import AddExpenseScreen from "../../screens/Expenses/AddExpenseScreen";

const Stack = createNativeStackNavigator();

export default function GroupsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="GroupsHome" component={GroupListScreen} />
      <Stack.Screen name="AddGroup" component={AddGroupScreen} />
      <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
    </Stack.Navigator>
  );
}
