import { View, Text, TextInput, Pressable, KeyboardAvoidingView, Platform, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";

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
  success: "#10B981",
  white: "#FFFFFF",
};

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to send reset email");
      }
      
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error:", error);
      // Still show success to prevent email enumeration
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <SafeAreaView style={styles.successContainer}>
        <View style={styles.successContent}>
          <View style={styles.successIcon}>
            <Text style={styles.emailEmoji}>✉️</Text>
          </View>
          <Text style={styles.successTitle}>
            Check your email
          </Text>
          <Text style={styles.successText}>
            We've sent password reset instructions to {email}
          </Text>
          <Pressable
            style={styles.successButton}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>
              {t("auth.login")}
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        {/* Back Button */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>← {t("common.back")}</Text>
        </Pressable>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>
            {t("auth.resetPassword")}
          </Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you reset instructions
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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

        {/* Submit Button */}
        <Pressable
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={isLoading || !email}
        >
          <Text style={styles.buttonText}>
            {isLoading ? t("common.loading") : t("auth.resetPassword")}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark900,
  },
  successContainer: {
    flex: 1,
    backgroundColor: colors.dark900,
    justifyContent: "center",
    paddingHorizontal: 24,
    alignItems: "center",
  },
  successContent: {
    alignItems: "center",
    width: "100%",
    maxWidth: 480,
  },
  successIcon: {
    width: 80,
    height: 80,
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  emailEmoji: {
    fontSize: 36,
  },
  successTitle: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  successText: {
    color: colors.dark400,
    textAlign: "center",
    marginBottom: 32,
  },
  successButton: {
    backgroundColor: colors.primary600,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    width: "100%",
    maxWidth: 480,
    alignSelf: "center",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 24,
  },
  backText: {
    color: colors.primary400,
    fontSize: 18,
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
  form: {
    marginBottom: 24,
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
  button: {
    backgroundColor: colors.primary600,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.primary700,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
});
