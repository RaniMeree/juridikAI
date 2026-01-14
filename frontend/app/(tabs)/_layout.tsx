import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";

// Theme colors
const colors = {
  primary: "#6366F1",
  dark700: "#334155",
  dark800: "#1E293B",
  dark500: "#64748B",
};

// Tab bar icons (using emoji for now - replace with proper icons later)
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    chat: "💬",
    documents: "📄",
    profile: "👤",
  };

  return (
    <View style={[styles.iconContainer, { opacity: focused ? 1 : 0.5 }]}>
      <Text style={styles.iconText}>{icons[name]}</Text>
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.dark800,
          borderTopColor: colors.dark700,
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.dark500,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Chat",
          tabBarIcon: ({ focused }) => <TabIcon name="chat" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="documents"
        options={{
          title: "Documents",
          tabBarIcon: ({ focused }) => <TabIcon name="documents" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 24,
  },
});
