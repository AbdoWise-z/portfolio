import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import React from "react";
import SecretContentContextProvider from "@/components/views/providers/secret-content-context-provider";
import {Button} from "@/components/ui/button";
import SecretContent from "@/components/views/secret-content";
import {Code, Github, Linkedin, LinkedinIcon, LucideGithub} from "lucide-react";
import Image from "next/image";
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from "@/components/ui/tooltip";

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
      <body className={JetBrainsMono.className}>
      <TooltipProvider>

      <SecretContentContextProvider>
        {children}

      </SecretContentContextProvider>
      </TooltipProvider>
      </body>
    </html>
  );
}
