import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { buildCommonHeaderOptions } from "../header/commonHeader";
import AccountScreen from "../../screens/Auth/AccountScreen";

const Stack = createNativeStackNavigator();
export default function AccountStack(){
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="AccountHome" component={AccountScreen} />
    </Stack.Navigator>
  );
}
