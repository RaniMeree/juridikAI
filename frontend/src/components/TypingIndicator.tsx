import { View, Text, StyleSheet } from "react-native";
import { useEffect, useState } from "react";

// Theme colors
const colors = {
  dark400: "#94A3B8",
  dark500: "#64748B",
  dark700: "#334155",
};

export default function TypingIndicator() {
  const [dots, setDots] = useState(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev >= 3 ? 1 : prev + 1));
    }, 400);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <View style={[styles.dot, { opacity: dots >= 1 ? 1 : 0.3 }]} />
        <View style={[styles.dot, { opacity: dots >= 2 ? 1 : 0.3 }]} />
        <View style={[styles.dot, { opacity: dots >= 3 ? 1 : 0.3, marginRight: 0 }]} />
      </View>
      <Text style={styles.text}>Thinking...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  bubble: {
    backgroundColor: colors.dark700,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    backgroundColor: colors.dark400,
    borderRadius: 5,
    marginRight: 4,
  },
  text: {
    color: colors.dark500,
    fontSize: 12,
    marginTop: 4,
    paddingHorizontal: 8,
  },
});
