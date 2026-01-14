import { Redirect } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useEffect } from "react";
import { View, ActivityIndicator, StyleSheet, Platform } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  // On web, redirect to landing page if not authenticated
  if (Platform.OS === "web" && !isAuthenticated) {
    return <Redirect href="/(web)/landing" />;
  }

  // Redirect based on auth state
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
});
