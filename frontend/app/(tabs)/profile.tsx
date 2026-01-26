import { View, Text, Pressable, ScrollView, Alert, Switch, StyleSheet, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useTranslation } from "@/hooks/useTranslation";
import { useAuthStore } from "@/store/authStore";
import { useState } from "react";

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
  error: "#EF4444",
  white: "#FFFFFF",
};

export default function ProfileScreen() {
  const { t, changeLanguage, currentLanguage, supportedLanguages } = useTranslation();
  const { user, logout, deleteAccount, subscription } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = async () => {
    console.log("Logout button clicked!");
    
    // For web, use window.confirm instead of Alert.alert
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to log out?");
      if (confirmed) {
        console.log("Logout confirmed, calling logout...");
        await logout();
        router.replace("/(auth)/welcome");
      }
    } else {
      Alert.alert(
        t("auth.logout"),
        "Are you sure you want to log out?",
        [
          { text: t("common.cancel"), style: "cancel" },
          { 
            text: t("auth.logout"), 
            style: "destructive", 
            onPress: async () => {
              console.log("Logout confirmed, calling logout...");
              await logout();
              router.replace("/(auth)/welcome");
            }
          },
        ]
      );
    }
  };

  const handleDeleteAccount = async () => {
    console.log("Delete account button clicked!");
    
    // For web, use window.confirm instead of Alert.alert
    if (Platform.OS === 'web') {
      const confirmed = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
      if (confirmed) {
        console.log("Delete account confirmed, calling deleteAccount...");
        const success = await deleteAccount();
        console.log("Delete account result:", success);
        if (success) {
          router.replace("/(auth)/welcome");
        } else {
          window.alert("Failed to delete account. Please try again.");
        }
      }
    } else {
      Alert.alert(
        t("profile.deleteAccount"),
        t("profile.deleteAccountConfirm"),
        [
          { text: t("common.cancel"), style: "cancel" },
          { 
            text: t("common.delete"), 
            style: "destructive",
            onPress: async () => {
              console.log("Delete account confirmed, calling deleteAccount...");
              const success = await deleteAccount();
              console.log("Delete account result:", success);
              if (success) {
                router.replace("/(auth)/welcome");
              } else {
                Alert.alert(t("common.error"), "Failed to delete account. Please try again.");
              }
            }
          },
        ]
      );
    }
  };

  const MenuItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightElement,
    danger = false 
  }: { 
    icon: string; 
    title: string; 
    subtitle?: string; 
    onPress?: () => void;
    rightElement?: React.ReactNode;
    danger?: boolean;
  }) => (
    <Pressable 
      style={styles.menuItem}
      onPress={onPress}
    >
      <View style={styles.menuIcon}>
        <Text style={styles.menuEmoji}>{icon}</Text>
      </View>
      <View style={styles.menuContent}>
        <Text style={[styles.menuTitle, danger && styles.menuTitleDanger]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.menuSubtitle}>{subtitle}</Text>}
      </View>
      {rightElement || <Text style={styles.menuArrow}>›</Text>}
    </Pressable>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t("profile.title")}</Text>
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.firstName?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
              </Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userName}>
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email
                }
              </Text>
              <Text style={styles.userEmail}>{user?.email}</Text>
            </View>
            <Pressable style={styles.editButton}>
              <Text style={styles.editButtonText}>{t("profile.editProfile")}</Text>
            </Pressable>
          </View>
        </View>

        {/* Subscription */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("profile.subscription")}
          </Text>
          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionHeader}>
              <Text style={styles.subscriptionPlan}>
                {subscription?.planType === "yearly" 
                  ? t("subscription.yearly")
                  : subscription?.planType === "monthly"
                    ? t("subscription.monthly")
                    : t("subscription.freeTrial")
                }
              </Text>
              <View style={styles.subscriptionBadge}>
                <Text style={styles.subscriptionBadgeText}>Active</Text>
              </View>
            </View>
            <View style={styles.subscriptionUsage}>
              <Text style={styles.subscriptionUsageLabel}>
                {t("subscription.queriesUsed")}
              </Text>
              <Text style={styles.subscriptionUsageValue}>
                {subscription?.queriesUsed || 0} / {subscription?.queryLimit || 100}
              </Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View 
                style={[styles.progressBar, { 
                  width: `${Math.min(
                    ((subscription?.queriesUsed || 0) / (subscription?.queryLimit || 100)) * 100,
                    100
                  )}%` 
                }]}
              />
            </View>
          </View>
          <Pressable style={styles.upgradeButton}>
            <Text style={styles.upgradeButtonText}>{t("subscription.upgrade")}</Text>
          </Pressable>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t("profile.settings")}
          </Text>
          
          <MenuItem
            icon="🌐"
            title={t("profile.language")}
            subtitle={supportedLanguages.find(l => l.code === currentLanguage)?.nativeName}
            onPress={() => {
              const nextLang = currentLanguage === "en" ? "sv" : "en";
              changeLanguage(nextLang);
            }}
          />

          <MenuItem
            icon="🔔"
            title={t("profile.notifications")}
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: colors.dark700, true: colors.primary600 }}
                thumbColor={colors.white}
              />
            }
          />
        </View>

        {/* Danger Zone */}
        <View style={styles.dangerSection}>
          <MenuItem icon="🚪" title={t("auth.logout")} onPress={handleLogout} />
          <MenuItem 
            icon="⚠️" 
            title={t("profile.deleteAccount")} 
            onPress={handleDeleteAccount}
            danger
          />
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark700,
    width: "100%",
    maxWidth: 768,
    alignSelf: "center",
  },
  headerTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "bold",
  },
  userSection: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark700,
    width: "100%",
    maxWidth: 768,
    alignSelf: "center",
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: colors.primary600,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: colors.white,
    fontSize: 24,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: colors.white,
    fontSize: 18,
    fontWeight: "600",
  },
  userEmail: {
    color: colors.dark400,
  },
  editButton: {
    backgroundColor: colors.dark700,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  editButtonText: {
    color: colors.primary400,
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
    color: colors.dark400,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 12,
  },
  subscriptionCard: {
    backgroundColor: colors.dark800,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.dark700,
  },
  subscriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  subscriptionPlan: {
    color: colors.white,
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
    fontSize: 14,
  },
  subscriptionUsage: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subscriptionUsageLabel: {
    color: colors.dark400,
  },
  subscriptionUsageValue: {
    color: colors.white,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: colors.dark700,
    borderRadius: 4,
    marginTop: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: colors.primary600,
    borderRadius: 4,
  },
  upgradeButton: {
    backgroundColor: colors.primary600,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  upgradeButtonText: {
    color: colors.white,
    fontWeight: "600",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
  },
  menuIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.dark700,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuEmoji: {
    fontSize: 20,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    color: colors.white,
    fontWeight: "600",
  },
  menuTitleDanger: {
    color: colors.error,
  },
  menuSubtitle: {
    color: colors.dark400,
    fontSize: 14,
  },
  menuArrow: {
    color: colors.dark500,
    fontSize: 20,
  },
  dangerSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 32,
    width: "100%",
    maxWidth: 768,
    alignSelf: "center",
  },
});
