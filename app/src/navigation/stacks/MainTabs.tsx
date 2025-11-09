// import React from "react";
// import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
// import GroupsStack from "./GroupsStack";
// import ExpensesStack from "./ExpensesStack";
// import PaymentsStack from "./PaymentsStack";
// import AccountStack from "./AccountStack";
// import ActivityStack from "./ActivityStack";

// const Tab = createBottomTabNavigator();

// export default function MainTabs() {

//   return (
//     <Tab.Navigator screenOptions={{ headerShown:false }}>
//       <Tab.Screen name="GroupsTab" component={GroupsStack} options={{ title:"Nhóm" }}/>
//       <Tab.Screen name="ExpensesTab" component={ExpensesStack} options={{ title:"Chi tiêu" }}/>
//       <Tab.Screen name="ActivitiesTab" component={ActivityStack} options={{ title:"Hoạt động" }}/>
//       <Tab.Screen name="PaymentsTab" component={PaymentsStack} options={{ title:"Thanh toán" }}/>
//       <Tab.Screen name="AccountTab" component={AccountStack} options={{ title:"Tài khoản" }} />

//     </Tab.Navigator>
//   );
// }

import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import GroupsStack from "./GroupsStack";
import ExpensesStack from "./ExpensesStack";
import PaymentsStack from "./PaymentsStack";
import AccountStack from "./AccountStack";
import ActivityStack from "./ActivityStack";

// 1) Khai báo rõ ràng các route (giúp TS bắt lỗi tên)
type TabParamList = {
  GroupsTab: undefined;
  ExpensesTab: undefined;
  ActivitiesTab: undefined;
  PaymentsTab: undefined;
  AccountTab: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

// 2) Lấy kiểu tên icon từ chính Ionicons (không còn string tự do)
type IoniconName = React.ComponentProps<typeof Ionicons>["name"];

// 3) Map route -> icon (được TS kiểm tra)
const ICONS: Record<keyof TabParamList, { active: IoniconName; inactive: IoniconName }> = {
  GroupsTab:     { active: "people",        inactive: "people-outline" },
  ExpensesTab:   { active: "wallet",        inactive: "wallet-outline" },
  ActivitiesTab: { active: "time",          inactive: "time-outline" },
  PaymentsTab:   { active: "cash",          inactive: "cash-outline" },
  AccountTab:    { active: "person",        inactive: "person-outline" },
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#ff922b",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: { backgroundColor: "#fff", height: 60, paddingBottom: 5 },
        tabBarIcon: ({ color, size, focused }) => {
          // 4) Lấy icon chuẩn theo route, luôn đúng kiểu IoniconName
          const pair = ICONS[route.name];
          const name: IoniconName = focused ? pair.active : pair.inactive;
          return <Ionicons name={name} size={size} color={color} />;
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "500" },
        tabBarHideOnKeyboard: true,
      })}
    >
      <Tab.Screen name="GroupsTab" component={GroupsStack} options={{ title: "Nhóm" }} />
      <Tab.Screen name="ExpensesTab" component={ExpensesStack} options={{ title: "Chi tiêu" }} />
      <Tab.Screen name="ActivitiesTab" component={ActivityStack} options={{ title: "Hoạt động" }} />
      <Tab.Screen name="PaymentsTab" component={PaymentsStack} options={{ title: "Thanh toán" }} />
      <Tab.Screen name="AccountTab" component={AccountStack} options={{ title: "Tài khoản" }} />
    </Tab.Navigator>
  );
}

