// app/src/navigation/stacks/AppStack.tsx
import React, { useLayoutEffect } from "react";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabs from "./MainTabs";
import { SafeAreaView } from "react-native-safe-area-context";

// chi tiết
import GroupDetailScreen from "../../screens/Groups/GroupDetailScreen";
import GroupSettingsScreen from "../../screens/Groups/GroupSettingsScreen";
import AddExpenseScreen from "../../screens/Expenses/AddExpenseScreen";
import UserBalancesScreen from "../../screens/Balances/UserBalancesScreen";
import AddPaymentScreen from "../../screens/Payments/AddPaymentScreen";

import { buildCommonHeaderOptions } from "../header/commonHeader";
import ExpenseDetailScreen from "../../screens/Expenses/ExpenseDetailScreen";
import EditExpenseScreen from "../../screens/Expenses/EditExpenseScreen";
import EditProfileScreen from "../../screens/Auth/EditProfileScreen";


export type AppStackParamList = {
  Main: undefined;
  GroupDetail: { id: number };
  GroupSettings: { id: number };
  AddExpense: { groupId: number; members?: any[] };
  UserBalances: { userId: number };
  AddPayment: { groupId: number };
  ExpenseDetail: { id: number };
  EditExpense: { expense: any };
  EditProfile: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

function MainShell({ navigation, route }: any) {
  const focused = getFocusedRouteNameFromRoute(route) ?? "GroupsTab";
  const titleMap: Record<string, string> = {
    GroupsTab: "Nhóm",
    ExpensesTab: "Chi tiêu",
    ActivitiesTab: "Hoạt động",
    PaymentsTab: "Thanh toán",
    AccountTab: "Tài khoản",
  };

  useLayoutEffect(() => {
    navigation.setOptions(
      buildCommonHeaderOptions({
        title: titleMap[focused] ?? "Ứng dụng",
        
      })
    );
  }, [navigation, focused]);

  return (
  <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}> 
    <MainTabs />
  </SafeAreaView>
);
}

export default function AppStack() {
  return (
    <Stack.Navigator>
      {/* Header CHUNG cho 5 tab */}
      <Stack.Screen
        name="Main"
        component={MainShell}
        options={{ headerShown: false }} 
      />

      {/* Các màn chi tiết (tách khỏi tabs) */}
      <Stack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={() => buildCommonHeaderOptions({ title: "Chi tiết nhóm" })}
      />
      <Stack.Screen
        name="GroupSettings"
        component={GroupSettingsScreen}
        options={() => buildCommonHeaderOptions({ title: "Cài đặt nhóm" })}
      />
      <Stack.Screen
        name="AddExpense"
        component={AddExpenseScreen}
        options={() => buildCommonHeaderOptions({ title: "Thêm chi tiêu" })}
      />
      <Stack.Screen
        name="UserBalances"
        component={UserBalancesScreen}
        options={() => buildCommonHeaderOptions({ title: "Chi tiết số dư" })}
      />
      <Stack.Screen
        name="AddPayment"
        component={AddPaymentScreen}
        options={() => buildCommonHeaderOptions({ title: "Thêm thanh toán" })}
      />
      <Stack.Screen
        name="ExpenseDetail"
        component={ExpenseDetailScreen}
        options={() => buildCommonHeaderOptions({ title: "Chi tiết chi tiêu" })}
      />
      <Stack.Screen
        name="EditExpense"
        component={EditExpenseScreen}
        options={() => buildCommonHeaderOptions({ title: "Chỉnh sửa chi tiêu" })}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={() => buildCommonHeaderOptions({ title: "Chỉnh sửa hồ sơ" })}
      />
    </Stack.Navigator>
  );
}
