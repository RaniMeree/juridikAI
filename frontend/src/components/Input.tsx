import { View, Text, TextInput as RNTextInput, TextInputProps, StyleSheet } from "react-native";
import { forwardRef } from "react";

// Theme colors
const colors = {
  dark300: "#CBD5E1",
  dark500: "#64748B",
  dark700: "#334155",
  dark800: "#1E293B",
  primary500: "#6366F1",
  error: "#EF4444",
  white: "#FFFFFF",
};

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<RNTextInput, InputProps>(
  ({ label, error, helperText, ...props }, ref) => {
    return (
      <View style={styles.container}>
        {label && (
          <Text style={styles.label}>{label}</Text>
        )}
        <RNTextInput
          ref={ref}
          style={[
            styles.input,
            error ? styles.inputError : styles.inputNormal,
          ]}
          placeholderTextColor={colors.dark500}
          {...props}
        />
        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}
        {helperText && !error && (
          <Text style={styles.helperText}>{helperText}</Text>
        )}
      </View>
    );
  }
);

Input.displayName = "Input";

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  label: {
    color: colors.dark300,
    marginBottom: 8,
    fontWeight: "500",
  },
  input: {
    backgroundColor: colors.dark800,
    color: colors.white,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    fontSize: 16,
  },
  inputNormal: {
    borderColor: colors.dark700,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginTop: 4,
  },
  helperText: {
    color: colors.dark500,
    fontSize: 14,
    marginTop: 4,
  },
});

export default Input;
