// app/src/navigation/header/AppHeader.tsx
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type AppHeaderProps = {
  title?: string;
  onPressCreate?: () => void;   // nút + bên phải (tuỳ stack thì truyền vào)
  rightLabel?: string;          // mặc định: "+ Tạo"
};

export function HeaderTitle({ title = "" }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text style={{ fontSize: 24, fontWeight: "800" }}>{title}</Text>
    </View>
  );
}

export function HeaderRight({ onPressCreate, rightLabel = "+ Tạo" }: AppHeaderProps) {
  if (!onPressCreate) return null;
  return (
    <TouchableOpacity onPress={onPressCreate} style={{ paddingHorizontal: 12, paddingVertical: 4 }}>
      <Text style={{ fontSize: 16, fontWeight: "600", color: "#1B76FF" }}>{rightLabel}</Text>
    </TouchableOpacity>
  );
}

// Màu & shadow header (áp dụng chung)
export const commonHeaderScreenOptions = {
  headerStyle: { backgroundColor: "#ffffffff" },
  headerTitleAlign: "left" as const,
  headerShadowVisible: true,
  headerTintColor: "#111",
};
