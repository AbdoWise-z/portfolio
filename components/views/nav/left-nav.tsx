"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import SocialIcon from "@/components/views/nav/social-icon";
import { SOCIAL_LINKS } from "@/lib/site";

const iconLink = "flex aspect-square items-center justify-center rounded-full";

/**
 * Photo and social links. A horizontal bar across the top on small screens,
 * a vertical rail down the left edge from the md breakpoint.
 */
const LeftNav = () => {
  const [copied, setCopied] = useState(false);

  const copyDiscord = async () => {
    try {
      await navigator.clipboard.writeText(SOCIAL_LINKS.discord);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard unavailable; the tooltip still shows the handle.
    }
  };

  return (
    <nav
      aria-label="Social links"
      className={
        "fixed left-0 top-0 flex w-full flex-row items-center gap-3 p-6 " +
        "max-md:bg-gradient-to-b max-md:from-[#05070f]/90 max-md:via-[#05070f]/60 max-md:to-transparent max-md:pb-8 " +
        "md:h-full md:w-[120px] md:flex-col md:p-8"
      }
    >
      <a className={iconLink} href="/" aria-label="Back to top">
        <Image src="/personal_photo.webp" width={45} height={45} alt="Abdelrahman Mahmoud" className="rounded-full" priority />
      </a>

      <div className="ml-auto md:mt-auto" />

      <a className={iconLink} href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
        <SocialIcon name="github" />
      </a>

      <a className={iconLink} href={`mailto:${SOCIAL_LINKS.email}`} aria-label="Email">
        <SocialIcon name="gmail" />
      </a>

      <a className={iconLink} href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
        <SocialIcon name="linkedin" />
      </a>

      <a className={iconLink} href={SOCIAL_LINKS.leetcode} target="_blank" rel="noopener noreferrer" aria-label="LeetCode">
        <SocialIcon name="leetcode" />
      </a>

      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className={iconLink} onClick={copyDiscord} aria-label={`Copy Discord username ${SOCIAL_LINKS.discord}`}>
            <SocialIcon name="discord" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{copied ? "Copied!" : SOCIAL_LINKS.discord}</TooltipContent>
      </Tooltip>

      <div className="mr-10 md:mb-10 md:mr-0" />
    </nav>
  );
};

export default LeftNav;
