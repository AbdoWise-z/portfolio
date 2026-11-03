"use client";

import React from "react";
import { MotionConfig } from "framer-motion";
import { ThemeProvider } from "next-themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import SecretContentContextProvider from "@/components/providers/secret-content-context-provider";
import ModelProvider from "@/components/providers/model-provider";

/** Client-side providers for the whole app. Respects the user's reduced-motion setting. */
const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={300}>
        <SecretContentContextProvider>
          <ModelProvider />
          {children}
        </SecretContentContextProvider>
      </TooltipProvider>
    </MotionConfig>
  </ThemeProvider>
);

export default AppProviders;
