import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";

export default function FeaturesPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'sv' ? 'en' : 'sv';
    i18n.changeLanguage(newLang);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.nav}>
          <Text style={styles.logo}>Juridik AI</Text>
          <View style={styles.navLinks}>
            <Link href="/(web)/landing" style={styles.navLink}>
              <Text style={styles.navLinkText}>{t('web.home')}</Text>
            </Link>
            <Link href="/(web)/features" style={styles.navLink}>
              <Text style={[styles.navLinkText, styles.activeLink]}>{t('web.features')}</Text>
            </Link>
            <Link href="/(web)/about" style={styles.navLink}>
              <Text style={styles.navLinkText}>{t('web.about')}</Text>
            </Link>
            <Link href="/(web)/contact" style={styles.navLink}>
              <Text style={styles.navLinkText}>{t('web.contact')}</Text>
            </Link>
            <Pressable
              style={styles.langButton}
              onPress={toggleLanguage}
            >
              <Text style={styles.langButtonText}>{i18n.language === 'sv' ? '🇸🇪 SV' : '🇬🇧 EN'}</Text>
            </Pressable>
            {isAuthenticated ? (
              <Pressable
                style={styles.loggedInButton}
                onPress={() => router.push("/(tabs)")}
              >
                <Text style={styles.loggedInButtonText}>
                  {user?.firstName || user?.email?.split('@')[0] || 'User'}
                </Text>
              </Pressable>
            ) : (
              <Pressable
                style={styles.loginButton}
                onPress={() => router.push("/(auth)/login")}
              >
                <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{t('web.featuresTitle')}</Text>
        <Text style={styles.heroSubtitle}>{t('web.featuresSubtitle')}</Text>
      </View>

      {/* Features Grid */}
      <View style={styles.content}>
        <View style={styles.featuresSection}>
          <View style={styles.featureRow}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>💬</Text>
              <Text style={styles.featureTitle}>{t('web.aiChat')}</Text>
              <Text style={styles.featureDescription}>
                {t('web.aiChatDesc')}
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>📄</Text>
              <Text style={styles.featureTitle}>{t('web.docAnalysis')}</Text>
              <Text style={styles.featureDescription}>
                {t('web.docAnalysisDesc')}
              </Text>
            </View>
          </View>

          <View style={styles.featureRow}>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>🌍</Text>
              <Text style={styles.featureTitle}>{t('web.multilingual')}</Text>
              <Text style={styles.featureDescription}>
                {t('web.multilingualDesc')}
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>👨‍⚖️</Text>
              <Text style={styles.featureTitle}>{t('web.expertConsultation')}</Text>
              <Text style={styles.featureDescription}>
                {t('web.expertConsultationDesc')}
              </Text>
            </View>
          </View>
        </View>

        {/* How it Works */}
        <View style={styles.howItWorksSection}>
          <Text style={styles.sectionTitle}>{t('web.howItWorks')}</Text>
          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepTitle}>{t('web.step1Title')}</Text>
              <Text style={styles.stepDescription}>{t('web.step1Desc')}</Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepTitle}>{t('web.step2Title')}</Text>
              <Text style={styles.stepDescription}>{t('web.step2Desc')}</Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepTitle}>{t('web.step3Title')}</Text>
              <Text style={styles.stepDescription}>{t('web.step3Desc')}</Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepTitle}>{t('web.step4Title')}</Text>
              <Text style={styles.stepDescription}>{t('web.step4Desc')}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>{t('web.readyToStart')}</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/signup")}
        >
          <Text style={styles.primaryButtonText}>{t('web.tryFree')}</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2026 Juridik AI. {t('web.allRightsReserved')}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    backgroundColor: "#0F172A",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderBottomWidth: 1,
    borderBottomColor: "#1E293B",
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: 1200,
    marginHorizontal: "auto",
    width: "100%",
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6366F1",
  },
  navLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: 30,
  },
  navLink: {
    marginHorizontal: 15,
  },
  navLinkText: {
    color: "#94A3B8",
    fontSize: 16,
    fontWeight: "500",
  },
  activeLink: {
    color: "#6366F1",
  },
  loginButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  langButton: {
    backgroundColor: "rgba(99, 102, 241, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#6366F1",
  },
  langButtonText: {
    color: "#6366F1",
    fontSize: 14,
    fontWeight: "600",
  },
  hero: {
    backgroundColor: "#0F172A",
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 20,
    color: "#94A3B8",
    textAlign: "center",
    maxWidth: 700,
  },
  content: {
    paddingVertical: 60,
  },
  featuresSection: {
    maxWidth: 1200,
    marginHorizontal: "auto",
    paddingHorizontal: 40,
    marginBottom: 80,
  },
  featureRow: {
    flexDirection: "row",
    gap: 30,
    marginBottom: 30,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  featureCard: {
    backgroundColor: "#F8FAFC",
    padding: 40,
    borderRadius: 12,
    flex: 1,
    minWidth: 350,
    maxWidth: 500,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
  howItWorksSection: {
    backgroundColor: "#F8FAFC",
    paddingVertical: 60,
    paddingHorizontal: 40,
    marginBottom: 80,
  },
  sectionTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 60,
  },
  stepsContainer: {
    maxWidth: 1000,
    marginHorizontal: "auto",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 40,
    justifyContent: "center",
  },
  step: {
    alignItems: "center",
    flex: 1,
    minWidth: 200,
  },
  stepNumber: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 12,
    textAlign: "center",
  },
  stepDescription: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    lineHeight: 24,
  },
  ctaSection: {
    backgroundColor: "#6366F1",
    paddingVertical: 60,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 32,
  },
  primaryButton: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: "#6366F1",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    backgroundColor: "#0F172A",
    paddingVertical: 40,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  footerText: {
    color: "#64748B",
    fontSize: 14,
  },
});
