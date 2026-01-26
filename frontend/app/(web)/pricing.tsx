import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";

export default function PricingPage() {
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
              <Text style={styles.navLinkText}>{t('web.features')}</Text>
            </Link>
            <Link href="/(web)/pricing" style={styles.navLink}>
              <Text style={[styles.navLinkText, styles.activeLink]}>{t('web.pricing')}</Text>
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
        <Text style={styles.heroTitle}>{t('web.pricing')}</Text>
        <Text style={styles.heroSubtitle}>
          Choose the perfect plan for your legal needs
        </Text>
      </View>

      {/* Pricing Grid */}
      <View style={styles.content}>
        <View style={styles.pricingSection}>
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
  loggedInButton: {
    backgroundColor: "#10B981",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  loggedInButtonText: {
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
  pricingSection: {
    maxWidth: 1200,
    marginHorizontal: "auto",
    paddingHorizontal: 40,
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
