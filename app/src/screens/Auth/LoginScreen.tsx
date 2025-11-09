// src/screens/Auth/LoginScreen.tsx
import React from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Image
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import { Ionicons } from "@expo/vector-icons";

import { useLogin } from "../../api/hooks";
import { useSetAuthToken } from "../../store/auth";

const schema = Yup.object({
  email: Yup.string().email("Email không hợp lệ").required("Bắt buộc"),
  password: Yup.string().min(6, "≥ 6 ký tự").required("Bắt buộc"),
});

export default function LoginScreen({ navigation }: any) {
  const login = useLogin();
  const setAuthToken = useSetAuthToken();

  const [remember, setRemember] = React.useState(true);
  const [showPwd, setShowPwd] = React.useState(false);

  return (
    <View style={styles.screen}>
      {/* HEADER */}
      <View style={{ height: 220, backgroundColor: "#ff922b", borderBottomLeftRadius: 24, borderBottomRightRadius: 24 }} />
      <Text
        style={{
          position: "absolute",
          top: 60,
          left: 20,
          right: 20,
        }}
      >
        <Text style={styles.heroTitle}>Chào mừng{"\n"}đến <Text style={{fontWeight:"900"}}>WEShare</Text></Text>
      </Text>

      {/* CARD FORM */}
      <View style={styles.card}>
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={schema}
          onSubmit={async (v, { setSubmitting }) => {
            try {
              const res = await login.mutateAsync(v);
              // useRegister/useLogin của bạn đã set AsyncStorage ở hooks
              setAuthToken(res.accessToken);
            } catch (e: any) {
              // có thể hiển thị toast/alert ngoài
              console.warn(e?.response?.data?.message || e?.message || "Đăng nhập thất bại");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ handleChange, handleSubmit, values, errors, touched, isSubmitting }) => (
            <>
              {/* Email */}
              <View style={styles.inputRow}>
                <Ionicons name="person-outline" size={18} color="#9AA0A6" />
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Email"
                  placeholderTextColor="#b0b0b0"
                  value={values.email}
                  onChangeText={handleChange("email")}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
              {touched.email && errors.email ? <Text style={styles.err}>{errors.email}</Text> : null}

              {/* Password */}
              <View style={[styles.inputRow, { marginTop: 10 }]}>
                <Ionicons name="lock-closed-outline" size={18} color="#9AA0A6" />
                <TextInput
                  style={styles.inputFlex}
                  placeholder="Mật khẩu"
                  placeholderTextColor="#b0b0b0"
                  value={values.password}
                  onChangeText={handleChange("password")}
                  secureTextEntry={!showPwd}
                />
                <TouchableOpacity onPress={() => setShowPwd(s => !s)}>
                  <Ionicons name={showPwd ? "eye-off-outline" : "eye-outline"} size={18} color="#9AA0A6" />
                </TouchableOpacity>
              </View>
              {touched.password && errors.password ? <Text style={styles.err}>{errors.password}</Text> : null}

              {/* Row: remember + forgot */}
              <View style={styles.rowBetween}>
                <TouchableOpacity
                  style={styles.checkRow}
                  onPress={() => setRemember(v => !v)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.checkbox, remember && styles.checkboxChecked]}>
                    {remember ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
                  </View>
                  <Text style={styles.checkText}>Lưu mật khẩu</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                  <Text style={styles.forgot}>Quên mật khẩu?</Text>
                </TouchableOpacity>
              </View>

              {/* Đăng nhập */}
              <TouchableOpacity
                onPress={() => handleSubmit() as any}
                disabled={isSubmitting || login.isPending}
                activeOpacity={0.9}
                style={[styles.primaryBtn, (isSubmitting || login.isPending) && styles.btnDisabled]}
              >
                {isSubmitting || login.isPending ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.primaryText}>Đăng nhập</Text>
                )}
              </TouchableOpacity>

              {/* Divider “Hoặc” */}
              <View style={styles.dividerWrap}>
                <View style={styles.divider} />
                <Text style={styles.dividerText}>Hoặc</Text>
                <View style={styles.divider} />
              </View>

              {/* Google Button (mock) */}
              <TouchableOpacity style={styles.googleBtn} activeOpacity={0.9} onPress={() => { /* TODO: Google sign-in */ }}>
                <Image
                  source={{ uri: "https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" }}
                  style={{ width: 18, height: 18, marginRight: 8 }}
                />
                <Text style={styles.googleText}>Đăng nhập với Google</Text>
              </TouchableOpacity>
            </>
          )}
        </Formik>
      </View>

      {/* Đăng ký */}
      <View style={{ alignItems: "center", marginTop: 18 }}>
        <Text style={{ color: "#111" }}>
          Bạn chưa có tài khoản?{" "}
          <Text style={styles.signup} onPress={() => navigation.navigate("Register")}>Đăng ký</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#fff" },

  hero: { height: 260, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: "hidden" },
  heroInner: { flex: 1, paddingHorizontal: 20, paddingTop: 42, justifyContent: "flex-end", paddingBottom: 26 },
  logoDot: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#fff", opacity: 0.9, marginBottom: 8 },
  heroTitle: { color: "#fff", fontSize: 34, lineHeight: 40, fontWeight: "800" },

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

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  checkRow: { flexDirection: "row", alignItems: "center" },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 1.5, borderColor: "#ff972f", alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  checkboxChecked: { backgroundColor: "#ff972f", borderColor: "#ff972f" },
  checkText: { marginLeft: 8, color: "#111" },
  forgot: { color: "#7f8c8d", fontWeight: "600" },

  primaryBtn: { marginTop: 14, backgroundColor: "#ff922b", height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  btnDisabled: { opacity: 0.7 },

  dividerWrap: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: 14 },
  divider: { flex: 1, height: 1, backgroundColor: "#eee" },
  dividerText: { fontWeight: "700", color: "#111" },

  googleBtn: {
    height: 48, borderRadius: 12,
    borderWidth: 1, borderColor: "#e6e6e6",
    alignItems: "center", justifyContent: "center",
    flexDirection: "row", backgroundColor: "#fff",
  },
  googleText: { fontWeight: "700", color: "#111" },

  signup: { color: "#ff922b", fontWeight: "800" },
});
