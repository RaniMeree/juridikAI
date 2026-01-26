import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { Link, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

export default function AboutPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

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
            <Link href="/(web)/about" style={styles.navLink}>
              <Text style={[styles.navLinkText, styles.activeLink]}>{t('web.about')}</Text>
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

      {/* Hero */}
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>{t('web.aboutTitle')}</Text>
        <Text style={styles.heroSubtitle}>{t('web.aboutSubtitle')}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>{t('web.ourMission')}</Text>
          <Text style={styles.paragraph}>
            {t('web.missionText')}
          </Text>
        </View>

        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>{t('web.whatWeDo')}</Text>
          <Text style={styles.paragraph}>
            {t('web.whatWeDoText')}
          </Text>
        </View>

        <View style={styles.valuesSection}>
          <Text style={styles.sectionTitle}>{t('web.ourValues')}</Text>
          <View style={styles.valuesGrid}>
            <View style={styles.valueCard}>
              <Text style={styles.valueIcon}>🎯</Text>
              <Text style={styles.valueTitle}>{t('web.accuracy')}</Text>
              <Text style={styles.valueText}>{t('web.accuracyText')}</Text>
            </View>
            <View style={styles.valueCard}>
              <Text style={styles.valueIcon}>🤝</Text>
              <Text style={styles.valueTitle}>{t('web.accessibility')}</Text>
              <Text style={styles.valueText}>{t('web.accessibilityText')}</Text>
            </View>
            <View style={styles.valueCard}>
              <Text style={styles.valueIcon}>🔐</Text>
              <Text style={styles.valueTitle}>{t('web.privacy')}</Text>
              <Text style={styles.valueText}>{t('web.privacyText')}</Text>
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
          <Text style={styles.primaryButtonText}>{t('web.getStarted')}</Text>
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
    maxWidth: 900,
    marginHorizontal: "auto",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  contentSection: {
    marginBottom: 50,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 18,
    color: "#475569",
    lineHeight: 28,
  },
  valuesSection: {
    marginBottom: 50,
    paddingVertical: 40,
    backgroundColor: "#F8FAFC",
    marginHorizontal: -40,
    paddingHorizontal: 40,
  },
  valuesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 30,
  },
  valueCard: {
    backgroundColor: "#FFFFFF",
    padding: 30,
    borderRadius: 12,
    width: 260,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  valueIcon: {
    fontSize: 40,
    marginBottom: 16,
  },
  valueTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 12,
    textAlign: "center",
  },
  valueText: {
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
