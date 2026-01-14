import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";
import { ReactNode } from "react";

// Theme colors
const colors = {
  primary600: "#4F46E5",
  primary700: "#4338CA",
  primary400: "#818CF8",
  dark600: "#475569",
  dark700: "#334155",
  dark800: "#1E293B",
  error: "#EF4444",
  errorDark: "#DC2626",
  white: "#FFFFFF",
};

interface ButtonProps {
  children: ReactNode;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  children,
  onPress,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
}: ButtonProps) {
  const getVariantStyle = () => {
    switch (variant) {
      case "primary":
        return styles.primary;
      case "secondary":
        return styles.secondary;
      case "outline":
        return styles.outline;
      case "ghost":
        return styles.ghost;
      case "danger":
        return styles.danger;
      default:
        return styles.primary;
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case "sm":
        return styles.sizeSm;
      case "md":
        return styles.sizeMd;
      case "lg":
        return styles.sizeLg;
      default:
        return styles.sizeMd;
    }
  };

  const getTextColor = () => {
    if (variant === "ghost") return colors.primary400;
    return colors.white;
  };

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return 14;
      case "md":
        return 16;
      case "lg":
        return 18;
      default:
        return 16;
    }
  };

  return (
    <Pressable
      style={[
        styles.base,
        getVariantStyle(),
        getSizeStyle(),
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color="#fff" size="small" />
      ) : (
        <>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, { color: getTextColor(), fontSize: getTextSize() }]}>
            {children}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primary: {
    backgroundColor: colors.primary600,
  },
  secondary: {
    backgroundColor: colors.dark700,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.dark600,
  },
  ghost: {
    backgroundColor: "transparent",
  },
  danger: {
    backgroundColor: colors.error,
  },
  sizeSm: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sizeMd: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  sizeLg: {
    paddingHorizontal: 32,
    paddingVertical: 16,
  },
  fullWidth: {
    width: "100%",
  },
  disabled: {
    opacity: 0.5,
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontWeight: "600",
  },
});
}
