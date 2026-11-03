"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import SocialIcon from "@/components/views/nav/social-icon";
import ThemeToggle from "@/components/views/nav/theme-toggle";
import { SOCIAL_LINKS } from "@/lib/site";

const iconLink =
  "flex aspect-square h-9 w-9 items-center justify-center rounded-full text-white/85 transition-colors hover:bg-white/15 hover:text-white md:h-10 md:w-10";

/**
 * Photo, social links and the theme switch. A horizontal bar across the top on
 * small screens, a vertical rail down the left edge from the md breakpoint.
 * The icons are drawn white with difference blending, so they stay visible
 * over light panels, dark panels and photos alike.
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
    <>
      {/* Small screens: a soft backdrop so the bar reads over any section. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-[45] h-24 bg-gradient-to-b from-background/90 via-background/60 to-transparent md:hidden"
      />

      <a
        className="fixed left-6 top-6 z-[46] flex aspect-square items-center justify-center rounded-full md:left-8 md:top-8"
        href="#main"
        aria-label="Back to top"
      >
        <Image src="/personal_photo.webp" width={45} height={45} alt="Abdelrahman Mahmoud" className="rounded-full" priority />
      </a>

      <nav
        aria-label="Social links"
        className={
          "fixed left-0 top-0 z-[46] flex w-full flex-row items-center justify-end gap-0 p-6 pl-20 pr-[76px] text-white mix-blend-difference " +
          "md:h-full md:w-[120px] md:flex-col md:justify-end md:gap-3 md:p-8 md:pb-[72px]"
        }
      >
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

        <ThemeToggle className="text-white/85 hover:bg-white/15 hover:text-white md:mt-4" />
      </nav>
    </>
  );
};

export default LeftNav;
