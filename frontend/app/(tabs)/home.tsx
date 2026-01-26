import { router } from "expo-router";
import { useEffect } from "react";

export default function HomeScreen() {
  // Redirect to landing page immediately when this screen loads
  useEffect(() => {
    router.replace("/(web)/landing");
  }, []);

  // Return empty view since we're redirecting
  return null;
}

