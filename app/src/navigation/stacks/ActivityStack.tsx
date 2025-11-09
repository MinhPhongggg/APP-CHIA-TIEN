import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ActivityFeedScreen from "../../screens/Activities/ActivityFeedScreen";


const Stack = createNativeStackNavigator();
export default function ActivityStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown:false }}>
      <Stack.Screen name="ActivityHome" component={ActivityFeedScreen} />
    </Stack.Navigator>
  );
}
