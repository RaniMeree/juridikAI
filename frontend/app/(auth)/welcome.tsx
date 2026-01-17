import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "@/hooks/useTranslation";

// Theme colors
const colors = {
  primary600: "#4F46E5",
  primary700: "#4338CA",
  dark300: "#CBD5E1",
  dark400: "#94A3B8",
  dark500: "#64748B",
  dark700: "#334155",
  dark800: "#1E293B",
  dark900: "#0F172A",
  white: "#FFFFFF",
};

export default function WelcomeScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo / Icon */}
        <View style={styles.logo}>
          <Image 
            source={require("@/assets/logo.png")} 
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

        {/* Buttons */}
        <View style={styles.buttons}>
          <Link href="/(auth)/signup" asChild>
            <Pressable style={styles.primaryButton}>
              <Text style={styles.buttonText}>
                {t("auth.signup")}
              </Text>
            </Pressable>
          </Link>

          <Link href="/(auth)/login" asChild>
            <Pressable style={styles.secondaryButton}>
              <Text style={styles.buttonText}>
                {t("auth.login")}
              </Text>
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
  container: {
    flex: 1,
    backgroundColor: colors.dark900,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  logo: {
    width: 96,
    height: 96,
    backgroundColor: colors.primary600,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 32,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  logoText: {
    color: colors.white,
    fontSize: 36,
    fontWeight: "bold",
  },
  title: {
    color: colors.white,
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    color: colors.dark400,
    fontSize: 18,
    textAlign: "center",
    marginBottom: 48,
    paddingHorizontal: 16,
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
  buttons: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    backgroundColor: colors.primary600,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: colors.dark800,
    borderWidth: 1,
    borderColor: colors.dark700,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  disclaimer: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  disclaimerText: {
    color: colors.dark500,
    fontSize: 12,
    textAlign: "center",
  },
});
