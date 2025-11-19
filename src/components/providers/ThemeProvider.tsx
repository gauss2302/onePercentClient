"use client";

import { useEffect, useState } from "react";
import { useThemeStore } from "@/lib/store/themeStore";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  // Prevent hydration mismatch by rendering nothing until mounted
  // Or render children without theme specific classes if critical for SEO/LCP
  // For a theme provider, rendering children is usually fine, but we might want to avoid
  // flashing the wrong theme.
  // However, since we are using 'class' strategy, the server renders without 'dark' class (light mode default).
  // If user is dark mode, client will add 'dark' class.
  // To avoid flash, we can hide content until mounted, or accept the flash.
  // A common pattern is to render children but accept that theme might switch.
  
  if (!mounted) {
      return <>{children}</>;
  }

  return <>{children}</>;
}
