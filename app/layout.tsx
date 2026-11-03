import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import SecretContentContextProvider from "@/components/providers/secret-content-context-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import ModelProvider from "@/components/providers/model-provider";

const JetBrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Abdelrahman Mahmoud",
  description:
    "Portfolio of Abdelrahman Mahmoud, a computer engineer and AI master's student. Projects in AI, game engines, chip design, robotics, and full-stack web.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body className={JetBrainsMono.className}>
        <TooltipProvider>
          <SecretContentContextProvider>
            <ModelProvider />
            {children}
          </SecretContentContextProvider>
        </TooltipProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
