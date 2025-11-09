
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AppNavigator from "./app/src/navigation/AppNavigator";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuth } from "./app/src/api/axios";
import { useSetAuthToken } from "./app/src/store/auth";
import { LogBox } from "react-native";

LogBox.ignoreAllLogs(true);

const client = new QueryClient();

export default function App() {
  const setToken = useSetAuthToken();

  React.useEffect(() => {
    (async () => {
      const t = await AsyncStorage.getItem("accessToken");
      if (t) { setAuth(t); setToken(t); }
    })();
  }, []);

  return (
    <QueryClientProvider client={client}>
      <AppNavigator />
    </QueryClientProvider>
  );
}
