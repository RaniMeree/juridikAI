import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function FeaturesPage() {
  const { t } = useTranslation();
  const router = useRouter();

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
              style={styles.loginButton}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text style={styles.loginButtonText}>{t('auth.login')}</Text>
            </Pressable>
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
              <Text style={styles.featureIcon}>🔍</Text>
              <Text style={styles.featureTitle}>{t('web.legalSearch')}</Text>
              <Text style={styles.featureDescription}>
                {t('web.legalSearchDesc')}
              </Text>
            </View>
            <View style={styles.featureCard}>
              <Text style={styles.featureIcon}>💾</Text>
              <Text style={styles.featureTitle}>{t('web.chatHistory')}</Text>
              <Text style={styles.featureDescription}>
                {t('web.chatHistoryDesc')}
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
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureTitle}>{t('web.crossPlatform')}</Text>
              <Text style={styles.featureDescription}>
                {t('web.crossPlatformDesc')}
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

        {/* Pricing */}
        <View style={styles.pricingSection}>
          <Text style={styles.sectionTitle}>{t('web.pricing')}</Text>
          <View style={styles.pricingGrid}>
            <View style={styles.pricingCard}>
              <Text style={styles.planName}>{t('web.freePlan')}</Text>
              <Text style={styles.price}>
                0 kr<Text style={styles.period}>/mån</Text>
              </Text>
              <View style={styles.features}>
                <Text style={styles.feature}>✓ 10 frågor per dag</Text>
                <Text style={styles.feature}>✓ Grundläggande funktioner</Text>
                <Text style={styles.feature}>✓ E-post support</Text>
              </View>
              <Pressable
                style={styles.planButton}
                onPress={() => router.push("/(auth)/signup")}
              >
                <Text style={styles.planButtonText}>{t('web.getStarted')}</Text>
              </Pressable>
            </View>

            <View style={[styles.pricingCard, styles.popularCard]}>
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>POPULÄR</Text>
              </View>
              <Text style={styles.planName}>{t('web.proPlan')}</Text>
              <Text style={styles.price}>
                199 kr<Text style={styles.period}>/mån</Text>
              </Text>
              <View style={styles.features}>
                <Text style={styles.feature}>✓ Obegränsade frågor</Text>
                <Text style={styles.feature}>✓ Alla funktioner</Text>
                <Text style={styles.feature}>✓ Dokumentanalys</Text>
                <Text style={styles.feature}>✓ Prioriterad support</Text>
              </View>
              <Pressable
                style={[styles.planButton, styles.primaryPlanButton]}
                onPress={() => router.push("/(auth)/signup")}
              >
                <Text style={styles.primaryPlanButtonText}>
                  {t('web.choosePlan')}
                </Text>
              </Pressable>
            </View>

            <View style={styles.pricingCard}>
              <Text style={styles.planName}>{t('web.businessPlan')}</Text>
              <Text style={styles.price}>
                999 kr<Text style={styles.period}>/mån</Text>
              </Text>
              <View style={styles.features}>
                <Text style={styles.feature}>✓ Allt i Pro</Text>
                <Text style={styles.feature}>✓ Team-samarbete</Text>
                <Text style={styles.feature}>✓ Anpassad AI</Text>
                <Text style={styles.feature}>✓ 24/7 support</Text>
              </View>
              <Pressable
                style={styles.planButton}
                onPress={() => router.push("/(web)/contact")}
              >
                <Text style={styles.planButtonText}>{t('web.contactSales')}</Text>
              </Pressable>
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
  pricingSection: {
    maxWidth: 1200,
    marginHorizontal: "auto",
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  pricingGrid: {
    flexDirection: "row",
    gap: 30,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  pricingCard: {
    backgroundColor: "#F8FAFC",
    padding: 40,
    borderRadius: 12,
    flex: 1,
    minWidth: 280,
    maxWidth: 350,
    borderWidth: 2,
    borderColor: "#E2E8F0",
  },
  popularCard: {
    borderColor: "#6366F1",
    backgroundColor: "#FFFFFF",
    transform: [{ scale: 1.05 }],
  },
  popularBadge: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  popularText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  planName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 16,
  },
  price: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#6366F1",
    marginBottom: 24,
  },
  period: {
    fontSize: 20,
    color: "#64748B",
  },
  features: {
    marginBottom: 32,
    gap: 12,
  },
  feature: {
    fontSize: 16,
    color: "#475569",
    lineHeight: 24,
  },
  planButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#6366F1",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  planButtonText: {
    color: "#6366F1",
    fontSize: 16,
    fontWeight: "600",
  },
  primaryPlanButton: {
    backgroundColor: "#6366F1",
    borderColor: "#6366F1",
  },
  primaryPlanButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
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
