/// <reference types="nativewind/types" />

declare const __DEV__: boolean;

// Extend SafeAreaView to accept className
declare module "react-native-safe-area-context" {
  interface NativeSafeAreaViewProps {
    className?: string;
  }
}
