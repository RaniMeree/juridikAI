import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";

// Theme colors
const colors = {
  primary400: "#818CF8",
  primary600: "#4F46E5",
  primary700: "#4338CA",
  dark400: "#94A3B8",
  dark500: "#64748B",
  dark600: "#475569",
  dark700: "#334155",
  dark800: "#1E293B",
  dark900: "#0F172A",
  white: "#FFFFFF",
};

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user, subscription } = useAuthStore();

  const QuickAction = ({
    icon,
    title,
    subtitle,
    onPress,
  }: {
    icon: string;
    title: string;
    subtitle: string;
    onPress: () => void;
  }) => (
    <Pressable style={styles.actionCard} onPress={onPress}>
      <View style={styles.actionIcon}>
        <Text style={styles.actionEmoji}>{icon}</Text>
      </View>
      <View style={styles.actionContent}>
        <Text style={styles.actionTitle}>{title}</Text>
        <Text style={styles.actionSubtitle}>{subtitle}</Text>
      </View>
      <Text style={styles.actionArrow}>›</Text>
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.greeting}>
              {t("common.hello")}, {user?.firstName || user?.email?.split("@")[0]}! 👋
            </Text>
            <Text style={styles.subtitle}>
              {t("home.welcomeMessage")}
            </Text>
          </View>

          {/* Subscription Status */}
          {subscription && (
            <View style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <Text style={styles.subscriptionTitle}>
                  {subscription.planType === "yearly"
                    ? t("subscription.yearly")
                    : subscription.planType === "monthly"
                    ? t("subscription.monthly")
                    : t("subscription.freeTrial")}
                </Text>
                <View style={styles.subscriptionBadge}>
                  <Text style={styles.subscriptionBadgeText}>
                    {subscription.status === "active" ? "Active" : subscription.status}
                  </Text>
                </View>
              </View>
              <View style={styles.subscriptionStats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {subscription.queriesUsed || 0}
                  </Text>
                  <Text style={styles.statLabel}>Queries Used</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {(subscription.queryLimit || 100) - (subscription.queriesUsed || 0)}
                  </Text>
                  <Text style={styles.statLabel}>Remaining</Text>
                </View>
              </View>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("home.quickActions")}</Text>

            <QuickAction
              icon="💬"
              title={t("home.startChat")}
              subtitle={t("home.startChatDescription")}
              onPress={() => router.push("/(tabs)")}
            />

            <QuickAction
              icon="📎"
              title={t("home.uploadDocument")}
              subtitle={t("home.uploadDocumentDescription")}
              onPress={() => router.push("/(tabs)")}
            />

            <QuickAction
              icon="👤"
              title={t("home.viewProfile")}
              subtitle={t("home.viewProfileDescription")}
              onPress={() => router.push("/(tabs)/profile")}
            />
          </View>

          {/* Features */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("home.features")}</Text>
            
            <View style={styles.featureGrid}>
              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>⚖️</Text>
                <Text style={styles.featureTitle}>{t("home.legalAdvice")}</Text>
                <Text style={styles.featureDescription}>
                  {t("home.legalAdviceDescription")}
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>📄</Text>
                <Text style={styles.featureTitle}>{t("home.documentAnalysis")}</Text>
                <Text style={styles.featureDescription}>
                  {t("home.documentAnalysisDescription")}
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>🌐</Text>
                <Text style={styles.featureTitle}>{t("home.multiLanguage")}</Text>
                <Text style={styles.featureDescription}>
                  {t("home.multiLanguageDescription")}
                </Text>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureEmoji}>🔒</Text>
                <Text style={styles.featureTitle}>{t("home.secure")}</Text>
                <Text style={styles.featureDescription}>
                  {t("home.secureDescription")}
                </Text>
              </View>
            </View>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>
              {t("legal.disclaimer")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark900,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark700,
    width: "100%",
    maxWidth: 768,
    alignSelf: "center",
  },
  greeting: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    color: colors.dark400,
    fontSize: 16,
  },
  subscriptionCard: {
    backgroundColor: colors.dark800,
    borderRadius: 16,
    padding: 20,
    margin: 16,
    borderWidth: 1,
    borderColor: colors.dark700,
    width: "calc(100% - 32px)",
    maxWidth: 736,
    alignSelf: "center",
  },
  subscriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  subscriptionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  subscriptionBadge: {
    backgroundColor: "rgba(79, 70, 229, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  subscriptionBadgeText: {
    color: colors.primary400,
    fontSize: 12,
    fontWeight: "600",
  },
  subscriptionStats: {
    flexDirection: "row",
    alignItems: "center",
  },
  stat: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "bold",
  },
  statLabel: {
    color: colors.dark400,
    fontSize: 14,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.dark700,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark700,
    width: "100%",
    maxWidth: 768,
    alignSelf: "center",
  },
  sectionTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.dark800,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.dark700,
  },
  actionIcon: {
    width: 48,
    height: 48,
    backgroundColor: colors.dark700,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  actionEmoji: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  actionSubtitle: {
    color: colors.dark400,
    fontSize: 14,
  },
  actionArrow: {
    color: colors.dark500,
    fontSize: 24,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  featureCard: {
    backgroundColor: colors.dark800,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.dark700,
    width: "48%",
    minWidth: 150,
  },
  featureEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  featureTitle: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  featureDescription: {
    color: colors.dark400,
    fontSize: 14,
    lineHeight: 20,
  },
  disclaimer: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    width: "100%",
    maxWidth: 768,
    alignSelf: "center",
  },
  disclaimerText: {
    color: colors.dark500,
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
});
