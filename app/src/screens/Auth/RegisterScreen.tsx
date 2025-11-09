// src/screens/Auth/RegisterScreen.tsx
import React from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, StyleSheet
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";

import { useRegister } from "../../api/hooks";

const schema = Yup.object({
  email: Yup.string().email("Email không hợp lệ").required("Bắt buộc"),
  displayName: Yup.string().min(3, "≥ 3 ký tự").required("Bắt buộc"),
  password: Yup.string().min(6, "≥ 6 ký tự").required("Bắt buộc"),
});

export default function RegisterScreen({ navigation }: any) {
  const reg = useRegister();
  const [showPwd, setShowPwd] = React.useState(false);

  return (
    <View style={styles.screen}>
      {/* HEADER (cam, bo góc giống Login) */}
      <View style={styles.hero} />
      <Text style={styles.heroText}>
        <Text style={styles.heroBold}>Tạo tài khoản{"\n"}</Text>
        để bắt đầu với <Text style={styles.brand}>WEShare</Text>
      </Text>

      {/* CARD FORM */}
      <View style={styles.card}>
        <Formik
          initialValues={{ email: "", displayName: "", password: "" }}
          validationSchema={schema}
          onSubmit={async (v, { setSubmitting }) => {
            try {
              await reg.mutateAsync(v); // onSuccess trong hook sẽ set token
            } catch (e: any) {
              console.warn(
                e?.response?.data?.message || e?.message || "Đăng ký thất bại"
              );
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ handleChange, handleSubmit, values, errors, touched, isSubmitting }) => (
            <>
              {/* Email */}
              <View style={styles.inputRow}>
                <Ionicons name="mail-outline" size={18} color="#9AA0A6" />
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Email"
                  placeholderTextColor="#b0b0b0"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={values.email}
                  onChangeText={handleChange("email")}
                />
              </View>
              {touched.email && errors.email ? (
                <Text style={styles.err}>{errors.email}</Text>
              ) : null}

              {/* Display name */}
              <View style={[styles.inputRow, { marginTop: 10 }]}>
                <Ionicons name="person-outline" size={18} color="#9AA0A6" />
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Tên hiển thị"
                  placeholderTextColor="#b0b0b0"
                  value={values.displayName}
                  onChangeText={handleChange("displayName")}
                />
              </View>
              {touched.displayName && errors.displayName ? (
                <Text style={styles.err}>{errors.displayName}</Text>
              ) : null}

              {/* Password */}
              <View style={[styles.inputRow, { marginTop: 10 }]}>
                <Ionicons name="lock-closed-outline" size={18} color="#9AA0A6" />
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Mật khẩu"
                  placeholderTextColor="#b0b0b0"
                  secureTextEntry={!showPwd}
                  value={values.password}
                  onChangeText={handleChange("password")}
                />
                <TouchableOpacity onPress={() => setShowPwd(s => !s)}>
                  <Ionicons
                    name={showPwd ? "eye-off-outline" : "eye-outline"}
                    size={18}
                    color="#9AA0A6"
                  />
                </TouchableOpacity>
              </View>
              {touched.password && errors.password ? (
                <Text style={styles.err}>{errors.password}</Text>
              ) : null}

              {/* Submit */}
              <TouchableOpacity
                onPress={() => handleSubmit() as any}
                disabled={isSubmitting || reg.isPending}
                activeOpacity={0.9}
                style={[
                  styles.primaryBtn,
                  (isSubmitting || reg.isPending) && styles.btnDisabled,
                ]}
              >
                {isSubmitting || reg.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryText}>Tạo tài khoản</Text>
                )}
              </TouchableOpacity>

              {/* Link đăng nhập */}
              <View style={{ alignItems: "center", marginTop: 16 }}>
                <Text style={{ color: "#111" }}>
                  Đã có tài khoản?{" "}
                  <Text
                    style={styles.signup}
                    onPress={() => navigation.navigate("Login")}
                  >
                    Đăng nhập
                  </Text>
                </Text>
              </View>
            </>
          )}
        </Formik>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },
  hero: {
    height: 220,
    backgroundColor: "#ff922b",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroText: {
    position: "absolute",
    top: 60,
    left: 20,
    right: 20,
    color: "#fff",
    fontSize: 28,
    lineHeight: 32,
  },
  heroBold: { fontWeight: "900", color: "#fff" },
  brand: { fontWeight: "900", color: "#fff" },

  card: {
    marginHorizontal: 18,
    marginTop: -40,
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1, borderColor: "#e6e6e6",
    borderRadius: 12, backgroundColor: "#fff",
    paddingHorizontal: 12, height: 48,
  },
  inputFlex: { flex: 1, marginLeft: 8, color: "#111" },
  err: { color: "#ef4444", marginTop: 6, marginBottom: 4 },

  primaryBtn: {
    marginTop: 14,
    backgroundColor: "#ff922b",
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  btnDisabled: { opacity: 0.7 },

  signup: { color: "#ff922b", fontWeight: "800" },
});
