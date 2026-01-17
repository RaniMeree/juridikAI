import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "@/hooks/useTranslation";

// Theme colors
const colors = {
  primary400: "#818CF8",
  primary500: "#6366F1",
  primary600: "#4F46E5",
  primary700: "#4338CA",
  primary800: "#3730A3",
  dark300: "#CBD5E1",
  dark400: "#94A3B8",
  dark500: "#64748B",
  dark700: "#334155",
  dark800: "#1E293B",
  dark850: "#172032",
  dark900: "#0F172A",
  dark950: "#020617",
  white: "#FFFFFF",
};

export default function WelcomeScreen() {
  const { t } = useTranslation();

  return (
    <LinearGradient
      colors={[colors.dark950, colors.dark900, colors.dark850]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          {/* Logo / Icon */}
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow} />
            <Image 
              source={require("../../../assets/logo.png")} 
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Title */}
          <Text style={styles.title}>
            {t("auth.welcome")}
          </Text>
          <Text style={styles.subtitle}>
            {t("auth.welcomeSubtitle")}
          </Text>

          {/* Features */}
          {/* <View style={styles.features}>
            <FeatureItem
              icon="⚖️"
              text={t("onboarding.slide1.description")}
            />
            <FeatureItem
              icon="📄"
              text={t("onboarding.slide2.description")}
            />
            <FeatureItem
              icon="🇸🇪"
              text={t("onboarding.slide3.description")}
            />
          </View> */}

          {/* Buttons Card */}
          <View style={styles.buttonCard}>
            <Link href="/(auth)/signup" asChild>
              <Pressable style={styles.primaryButton}>
                {({ pressed }) => (
                  <LinearGradient
                    colors={[colors.primary500, colors.primary700]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.buttonGradient, pressed && styles.buttonPressed]}
                  >
                    <Text style={styles.buttonText}>
                      {t("auth.signup")}
                    </Text>
                  </LinearGradient>
                )}
              </Pressable>
            </Link>

            <Link href="/(auth)/login" asChild>
              <Pressable style={styles.secondaryButton}>
                {({ pressed }) => (
                  <View style={[styles.secondaryButtonInner, pressed && styles.buttonPressed]}>
                    <Text style={styles.secondaryButtonText}>
                      {t("auth.login")}
                    </Text>
                  </View>
                )}
              </Pressable>
            </Link>
          </View>
        </View>

        {/* Legal Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            {t("legal.disclaimerShort")}
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.featureItem}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  logoContainer: {
    position: "relative",
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 48,
  },
  logoGlow: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: colors.primary600,
    opacity: 0.2,
    shadowColor: colors.primary500,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 40,
    elevation: 20,
  },
  logoImage: {
    width: 120,
    height: 120,
    borderRadius: 30,
  },
  logoText: {
    color: colors.white,
    fontSize: 36,
    fontWeight: "bold",
  },
  title: {
    color: colors.white,
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: colors.dark400,
    fontSize: 17,
    fontWeight: "400",
    textAlign: "center",
    marginBottom: 64,
    paddingHorizontal: 24,
    lineHeight: 24,
  },
  features: {
    width: "100%",
    marginBottom: 48,
    gap: 16,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(30, 41, 59, 0.5)",
    padding: 16,
    borderRadius: 12,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    color: colors.dark300,
    flex: 1,
  },
  buttonCard: {
    width: "100%",
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    borderRadius: 24,
    padding: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.2)",
    shadowColor: colors.primary600,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  primaryButton: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: colors.primary600,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  secondaryButton: {
    borderRadius: 16,
    overflow: "hidden",
  },
  secondaryButtonInner: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    borderWidth: 1.5,
    borderColor: colors.dark700,
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryButtonText: {
    color: colors.white,
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  disclaimer: {
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  disclaimerText: {
    color: colors.dark500,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
