import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Image } from "react-native";
import { Link, useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

export default function LandingPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'sv' ? 'en' : 'sv';
    i18n.changeLanguage(newLang);
  };

  return (
    <LinearGradient
      colors={['#020617', '#0F172A', '#172032']}
      style={styles.gradient}
    >
      <ScrollView style={styles.container}>
      {/* Header/Navigation */}
      <View style={styles.header}>
        <View style={styles.nav}>
          <View style={styles.logoContainer}>
            <Image 
              source={require("../../assets/logo.png")} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Juridik AI</Text>
          </View>
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
              style={styles.langButton}
              onPress={toggleLanguage}
            >
              <Text style={styles.langButtonText}>{i18n.language === 'sv' ? '🇸🇪 SV' : '🇬🇧 EN'}</Text>
            </Pressable>
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
        <View style={styles.heroContent}>
          <View style={styles.heroText}>
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
          <View style={styles.heroImageContainer}>
            <Image 
              source={require("../../assets/lagboken1.jpg")} 
              style={styles.heroImage}
              resizeMode="cover"
            />
          </View>
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
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    paddingVertical: 20,
    paddingHorizontal: 40,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(100, 116, 139, 0.2)",
  },
  nav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: 1200,
    marginHorizontal: "auto",
    width: "100%",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoImage: {
    width: 40,
    height: 40,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6366F1",
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
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  heroContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: 1200,
    marginHorizontal: "auto",
    gap: 60,
  },
  heroText: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 56,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 24,
    letterSpacing: -1,
  },
  heroSubtitle: {
    fontSize: 20,
    color: "#94A3B8",
    marginBottom: 48,
    lineHeight: 32,
  },
  heroImageContainer: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 15,
  },
  heroImage: {
    width: "100%",
    height: 400,
  },
  ctaButtons: {
    flexDirection: "row",
    gap: 20,
  },
  primaryButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  secondaryButton: {
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#334155",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  section: {
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  sectionTitle: {
    fontSize: 40,
    fontWeight: "800",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 60,
    letterSpacing: -0.5,
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
    backgroundColor: "rgba(30, 41, 59, 0.4)",
    padding: 32,
    borderRadius: 24,
    width: 300,
    borderWidth: 1,
    borderColor: "rgba(100, 116, 139, 0.2)",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: "#94A3B8",
    lineHeight: 24,
  },
  ctaSection: {
    backgroundColor: "rgba(30, 41, 59, 0.6)",
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(100, 116, 139, 0.2)",
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
    backgroundColor: "rgba(15, 23, 42, 0.8)",
    paddingVertical: 40,
    paddingHorizontal: 40,
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "rgba(100, 116, 139, 0.2)",
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
