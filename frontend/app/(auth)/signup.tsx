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

export default function SignupScreen() {
  const { t } = useTranslation();
  const { signup, isLoading, error } = useAuthStore();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState("");

  const handleSignup = async () => {
    setLocalError("");

    // Validation
    if (password !== confirmPassword) {
      setLocalError(t("auth.errors.passwordsDoNotMatch"));
      return;
    }
    if (password.length < 8) {
      setLocalError(t("auth.errors.passwordMinLength"));
      return;
    }

    const success = await signup({ firstName, lastName, email, password });
    if (success) {
      router.replace("/(tabs)");
    }
  };

  const displayError = localError || error;

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
                {t("auth.signup")}
              </Text>
              <Text style={styles.subtitle}>
                {t("auth.welcomeSubtitle")}
              </Text>
            </View>

            {/* Error Message */}
            {displayError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{displayError}</Text>
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              {/* Name Row */}
              <View style={styles.nameRow}>
                <View style={styles.nameField}>
                  <Text style={styles.label}>
                    {t("auth.firstName")}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="John"
                    placeholderTextColor={colors.dark500}
                    value={firstName}
                    onChangeText={setFirstName}
                    autoComplete="given-name"
                  />
                </View>
                <View style={styles.nameField}>
                  <Text style={styles.label}>
                    {t("auth.lastName")}
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Doe"
                    placeholderTextColor={colors.dark500}
                    value={lastName}
                    onChangeText={setLastName}
                    autoComplete="family-name"
                  />
                </View>
              </View>

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
                  autoComplete="new-password"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  {t("auth.confirmPassword")}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={colors.dark500}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  autoComplete="new-password"
                />
              </View>
            </View>

            {/* Terms */}
            <Text style={styles.termsText}>
              {t("auth.termsAgree")}{" "}
              <Text style={styles.termsLink}>{t("auth.termsOfService")}</Text>
              {" "}{t("auth.and")}{" "}
              <Text style={styles.termsLink}>{t("auth.privacyPolicy")}</Text>
            </Text>

            {/* Sign Up Button */}
            <Pressable
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? t("common.loading") : t("auth.signup")}
              </Text>
            </Pressable>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>
                {t("auth.alreadyHaveAccount")}{" "}
              </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text style={styles.loginLink}>
                    {t("auth.login")}
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
    paddingVertical: 32,
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
  nameRow: {
    flexDirection: "row",
    gap: 16,
  },
  nameField: {
    flex: 1,
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
  termsText: {
    color: colors.dark400,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 24,
  },
  termsLink: {
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  loginText: {
    color: colors.dark400,
  },
  loginLink: {
    color: colors.primary400,
    fontWeight: "600",
  },
});
