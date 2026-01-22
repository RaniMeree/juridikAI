import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";

// Theme colors
const colors = {
  primary400: "#818CF8",
  primary600: "#4F46E5",
  primary700: "#4338CA",
  dark300: "#CBD5E1",
  dark400: "#94A3B8",
  dark500: "#64748B",
  dark700: "#334155",
  dark800: "#1E293B",
  dark900: "#0F172A",
  error: "#EF4444",
  white: "#FFFFFF",
};

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login, isLoading, error } = useAuthStore();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const success = await login(email, password);
    if (success) {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        <ScrollView 
          style={styles.flex1} 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.title}>
                {t("auth.login")}
              </Text>
              <Text style={styles.subtitle}>
                {t("auth.welcomeSubtitle")}
              </Text>
            </View>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {t("auth.email")}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.dark500}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {t("auth.password")}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.dark500}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  autoComplete="password"
                />
              </View>

              <Link href="/(auth)/forgot-password" asChild>
                <Pressable style={styles.forgotLink}>
                  <Text style={styles.linkText}>
                    {t("auth.forgotPassword")}
                  </Text>
                </Pressable>
              </Link>
            </View>

            {/* Login Button */}
            <Pressable
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? t("common.loading") : t("auth.login")}
              </Text>
            </Pressable>

            {/* Sign Up Link */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>
                {t("auth.dontHaveAccount")}{" "}
              </Text>
              <Link href="/(auth)/signup" asChild>
                <Pressable>
                  <Text style={styles.signupLink}>
                    {t("auth.signup")}
                  </Text>
                </Pressable>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark900,
  },
  flex1: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  header: {
    marginBottom: 32,
  },
  title: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.dark400,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderWidth: 1,
    borderColor: colors.error,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
  },
  form: {
    marginBottom: 24,
    gap: 16,
  },
  inputGroup: {
    marginBottom: 4,
  },
  label: {
    color: colors.dark300,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: colors.dark800,
    color: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.dark700,
    fontSize: 16,
  },
  forgotLink: {
    alignSelf: "flex-end",
  },
  linkText: {
    color: colors.primary400,
  },
  button: {
    backgroundColor: colors.primary600,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  buttonDisabled: {
    backgroundColor: colors.primary700,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    color: colors.dark400,
  },
  signupLink: {
    color: colors.primary400,
    fontWeight: "600",
  },
});
