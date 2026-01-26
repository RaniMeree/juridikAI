import { View, Text, StyleSheet, ScrollView, Pressable, TextInput } from "react-native";
import { Link, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const toggleLanguage = () => {
    const newLang = i18n.language === 'sv' ? 'en' : 'sv';
    i18n.changeLanguage(newLang);
  };

  const handleSubmit = () => {
    // TODO: Implement contact form submission
    console.log("Contact form submitted:", formData);
    alert(t('web.messageSent'));
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
              <Text style={styles.navLinkText}>{t('web.pricing')}</Text>
            </Link>
            <Link href="/(web)/about" style={styles.navLink}>
              <Text style={styles.navLinkText}>{t('web.about')}</Text>
            </Link>
            <Link href="/(web)/contact" style={styles.navLink}>
              <Text style={[styles.navLinkText, styles.activeLink]}>{t('web.contact')}</Text>
            </Link>
            <Pressable
              style={styles.langButton}
              onPress={toggleLanguage}
            >
              <Text style={styles.langButtonText}>{i18n.language === 'sv' ? '🇸🇪 SV' : '🇬🇧 EN'}</Text>
            </Pressable>
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
        <Text style={styles.heroTitle}>{t('web.contactTitle')}</Text>
        <Text style={styles.heroSubtitle}>{t('web.contactSubtitle')}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.contentGrid}>
          {/* Contact Info */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>{t('web.getInTouch')}</Text>
            <Text style={styles.paragraph}>
              {t('web.contactIntro')}
            </Text>

            <View style={styles.contactCards}>
              <View style={styles.contactCard}>
                <Text style={styles.contactIcon}>📧</Text>
                <Text style={styles.contactLabel}>{t('web.email')}</Text>
                <Text style={styles.contactValue}>support@juridikai.se</Text>
              </View>

              <View style={styles.contactCard}>
                <Text style={styles.contactIcon}>📞</Text>
                <Text style={styles.contactLabel}>{t('web.phone')}</Text>
                <Text style={styles.contactValue}>+46 8 123 456 78</Text>
              </View>

              <View style={styles.contactCard}>
                <Text style={styles.contactIcon}>📍</Text>
                <Text style={styles.contactLabel}>{t('web.address')}</Text>
                <Text style={styles.contactValue}>Stockholm, Sweden</Text>
              </View>

              <View style={styles.contactCard}>
                <Text style={styles.contactIcon}>⏰</Text>
                <Text style={styles.contactLabel}>{t('web.hours')}</Text>
                <Text style={styles.contactValue}>Mån-Fre: 9:00-17:00</Text>
              </View>
            </View>
          </View>

          {/* Contact Form */}
          <View style={styles.formSection}>
            <Text style={styles.formTitle}>{t('web.sendMessage')}</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('web.name')}</Text>
              <TextInput
                style={styles.input}
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
                placeholder={t('web.namePlaceholder')}
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('web.email')}</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                onChangeText={(text) => setFormData({ ...formData, email: text })}
                placeholder={t('web.emailPlaceholder')}
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('web.subject')}</Text>
              <TextInput
                style={styles.input}
                value={formData.subject}
                onChangeText={(text) => setFormData({ ...formData, subject: text })}
                placeholder={t('web.subjectPlaceholder')}
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t('web.message')}</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={formData.message}
                onChangeText={(text) => setFormData({ ...formData, message: text })}
                placeholder={t('web.messagePlaceholder')}
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>

            <Pressable style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>{t('web.sendMessage')}</Text>
            </Pressable>
          </View>
        </View>
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
    maxWidth: 1200,
    marginHorizontal: "auto",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  contentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 40,
  },
  infoSection: {
    flex: 1,
    minWidth: 300,
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
    marginBottom: 40,
  },
  contactCards: {
    gap: 20,
  },
  contactCard: {
    backgroundColor: "#F8FAFC",
    padding: 20,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#6366F1",
  },
  contactIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 16,
    color: "#0F172A",
    fontWeight: "600",
  },
  formSection: {
    flex: 1,
    minWidth: 400,
    backgroundColor: "#F8FAFC",
    padding: 40,
    borderRadius: 12,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0F172A",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#0F172A",
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  submitButton: {
    backgroundColor: "#6366F1",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  submitButtonText: {
    color: "#FFFFFF",
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
