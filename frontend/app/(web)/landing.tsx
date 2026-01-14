import { View, Text, StyleSheet, ScrollView, Pressable, Platform } from "react-native";
import { Link, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function LandingPage() {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      {/* Header/Navigation */}
      <View style={styles.header}>
        <View style={styles.nav}>
          <Text style={styles.logo}>Juridik AI</Text>
          <View style={styles.navLinks}>
            <Link href="/(web)/landing" style={styles.navLink}>
              <Text style={styles.navLinkText}>{t('web.home')}</Text>
            </Link>
            <Link href="/(web)/features" style={styles.navLink}>
              <Text style={styles.navLinkText}>{t('web.features')}</Text>
            </Link>
            <Link href="/(web)/about" style={styles.navLink}>
              <Text style={styles.navLinkText}>{t('web.about')}</Text>
            </Link>
            <Link href="/(web)/contact" style={styles.navLink}>
              <Text style={styles.navLinkText}>{t('web.contact')}</Text>
            </Link>
            <Pressable
              style={styles.loginButton}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{t('web.heroTitle')}</Text>
        <Text style={styles.heroSubtitle}>{t('web.heroSubtitle')}</Text>
        <View style={styles.ctaButtons}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => router.push("/(auth)/signup")}
          >
            <Text style={styles.primaryButtonText}>{t('web.getStarted')}</Text>
          </Pressable>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => router.push("/(web)/features")}
          >
            <Text style={styles.secondaryButtonText}>{t('web.learnMore')}</Text>
          </Pressable>
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('web.whyChoose')}</Text>
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🤖</Text>
            <Text style={styles.featureTitle}>{t('web.aiPowered')}</Text>
            <Text style={styles.featureDescription}>
              {t('web.aiPoweredDesc')}
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureTitle}>{t('web.instantAnswers')}</Text>
            <Text style={styles.featureDescription}>
              {t('web.instantAnswersDesc')}
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>📚</Text>
            <Text style={styles.featureTitle}>{t('web.legalDocs')}</Text>
            <Text style={styles.featureDescription}>
              {t('web.legalDocsDesc')}
            </Text>
          </View>
          <View style={styles.featureCard}>
            <Text style={styles.featureIcon}>🔒</Text>
            <Text style={styles.featureTitle}>{t('web.secure')}</Text>
            <Text style={styles.featureDescription}>
              {t('web.secureDesc')}
            </Text>
          </View>
        </View>
      </View>

      {/* CTA Section */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>{t('web.readyToStart')}</Text>
        <Text style={styles.ctaSubtitle}>{t('web.joinThousands')}</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/(auth)/signup")}
        >
          <Text style={styles.primaryButtonText}>{t('web.createAccount')}</Text>
        </Pressable>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2026 Juridik AI. {t('web.allRightsReserved')}
        </Text>
        <View style={styles.footerLinks}>
          <Link href="/(web)/about" style={styles.footerLink}>
            <Text style={styles.footerLinkText}>{t('web.about')}</Text>
          </Link>
          <Link href="/(web)/contact" style={styles.footerLink}>
            <Text style={styles.footerLinkText}>{t('web.contact')}</Text>
          </Link>
          <Text style={styles.footerLinkText}>{t('web.privacy')}</Text>
          <Text style={styles.footerLinkText}>{t('web.terms')}</Text>
        </View>
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
  hero: {
    backgroundColor: "#0F172A",
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 20,
    maxWidth: 800,
  },
  heroSubtitle: {
    fontSize: 20,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 40,
    maxWidth: 600,
    lineHeight: 30,
  },
  ctaButtons: {
    flexDirection: "row",
    gap: 20,
  },
  primaryButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#6366F1",
  },
  secondaryButtonText: {
    color: "#6366F1",
    fontSize: 18,
    fontWeight: "600",
  },
  section: {
    paddingVertical: 80,
    paddingHorizontal: 40,
    backgroundColor: "#F8FAFC",
  },
  sectionTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 60,
  },
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 30,
    maxWidth: 1200,
    marginHorizontal: "auto",
  },
  featureCard: {
    backgroundColor: "#FFFFFF",
    padding: 30,
    borderRadius: 12,
    width: 280,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: "#64748B",
    lineHeight: 24,
  },
  ctaSection: {
    backgroundColor: "#6366F1",
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  ctaTitle: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 16,
  },
  ctaSubtitle: {
    fontSize: 18,
    color: "#E0E7FF",
    textAlign: "center",
    marginBottom: 32,
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
    marginBottom: 20,
  },
  footerLinks: {
    flexDirection: "row",
    gap: 30,
  },
  footerLink: {
    marginHorizontal: 10,
  },
  footerLinkText: {
    color: "#94A3B8",
    fontSize: 14,
  },
});
