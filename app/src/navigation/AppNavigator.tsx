import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuthToken } from "../store/auth";
import AuthStack from "./stacks/AuthStack";
import AppStack from "./stacks/AppStack";

export default function AppNavigator() {
  const token = useAuthToken();
  return (
    <NavigationContainer>
      {token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
