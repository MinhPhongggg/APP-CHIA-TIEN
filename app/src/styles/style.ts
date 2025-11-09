// app/src/styles.ts
import { StyleSheet, Platform } from "react-native";

/** Design tokens */
export const colors = {
  bg: "#f7f7f7",
  card: "#ffffff",
  text: "#000000ff",
  sub: "#666666",
  border: "#e5e7eb",
  primary: "#007AFF",
  success: "#16a34a",
  danger: "#ef4444",
  infoBg: "#F1F5FF",
  successBg: "#E8F5E9",
  background: "#FFFFFF",
  primaryBg: "#007AFF10",
};

export const spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24,
};

export const radius = {
  sm: 8, md: 10, lg: 12, xl: 16,
};

/** Shadow helper: iOS shadow + Android elevation */
export function shadow(level: 0 | 1 | 2 = 1) {
  if (level === 0) return {};
  const ios = [
    { shadowOpacity: 0.06, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
    { shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  ][level - 1];
  return Platform.select({
    ios: ios as object,
    android: { elevation: level + 1 },
    default: {},
  })!;
}

/** Text variants */
export const text = StyleSheet.create({
  title: { fontSize: 18, fontWeight: "800", color: colors.text },
  h2: { fontSize: 16, fontWeight: "700", color: colors.text },
  h5: { fontSize: 22, fontWeight: "800", color: "#111" },
  body: { color: colors.text },
  sub: { color: colors.sub },
  link: { color: colors.primary, fontWeight: "700" },
  danger: { color: colors.danger, fontWeight: "700" },
   label: { fontWeight: "600", color: "#333", marginBottom: 6 },
    error: { color: "#ef4444", marginTop: 4 },
});

/** Common UI blocks */
export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#fff",
    height: 46,
  },
  inputFlex: { flex: 1, paddingLeft: 8 },
  

  // Cards & rows
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadow(1),
  },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    ...shadow(1),
  },
  rowCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    ...shadow(1),
  },
  sectionHeaderWrap: { paddingTop: spacing.sm, paddingBottom: spacing.sm },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },

  // Avatars / Badges
  avatar: {
    width: 36, height: 36, borderRadius: radius.sm,
    alignItems: "center", justifyContent: "center",
    backgroundColor: colors.successBg,
  },
  badgeInfo: {
    paddingHorizontal: spacing.sm, paddingVertical: 2,
    borderRadius: radius.md, backgroundColor: colors.infoBg,
  },

  // Inputs
  input: {
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md,
    padding: spacing.sm, backgroundColor: "#fff",
  },

  // Buttons
  btnDisabled: { opacity: 0.6 },
  btnPrimary: {
    backgroundColor: colors.success,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
  },
  btnPrimaryText: { color: "#fff", fontWeight: "800" },

  btnSecondary: {
    backgroundColor: "#007AFF10",
    borderWidth: 1, borderColor: "#007AFF30",
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
  },
  btnSecondaryText: { color: colors.primary, fontWeight: "800" },

  btnDanger: {
    backgroundColor: colors.danger,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    alignItems: "center",
  },
  btnDangerText: { color: "#fff", fontWeight: "800" },

  // Utilities
  row: { flexDirection: "row", alignItems: "center" },
  between: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  gapXs: { gap: spacing.xs }, gapSm: { gap: spacing.sm }, gapMd: { gap: spacing.md },
  mtSm: { marginTop: spacing.sm }, mtMd: { marginTop: spacing.md }, mtLg: { marginTop: spacing.lg },
});
