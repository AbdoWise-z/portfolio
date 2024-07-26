import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import SecretContentContextProvider from "@/components/providers/secret-content-context-provider";
import {Button} from "@/components/ui/button";
import SecretContent from "@/components/views/secret-content";
import {Code, Github, Linkedin, LinkedinIcon, LucideGithub} from "lucide-react";
import Image from "next/image";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import theme from "tailwindcss/defaultTheme";
import {ThemeProvider} from "@/components/providers/theme-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import ModelProvider from "@/components/providers/model-provider";

const JetBrainsMono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Portfolio",
  description: "My Awesome portfolio.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <GoogleAnalytics />
      <body className={JetBrainsMono.className}>

      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
      >
        <TooltipProvider>
          <SecretContentContextProvider>
            <ModelProvider />
            {children}

          </SecretContentContextProvider>
        </TooltipProvider>
      </ThemeProvider>

      </body>
    </html>
  );
}
