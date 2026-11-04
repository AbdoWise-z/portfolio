/** Site-wide constants. Everything here is also what the metadata is built from. */

export const SITE_NAME = "Abdelrahman Mahmoud";

export const SITE_DESCRIPTION =
  "Portfolio of Abdelrahman Mahmoud, a computer engineer and AI master's student. " +
  "Projects in AI, game engines, chip design, robotics, and full-stack web.";

/** Set NEXT_PUBLIC_SITE_URL in .env to the deployed origin so absolute URLs resolve. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio-xabdomos-projects.vercel.app";

export const SOCIAL_LINKS = {
  github: "https://github.com/AbdoWise-z",
  linkedin: "https://www.linkedin.com/in/xabdomo/",
  leetcode: "https://leetcode.com/u/AQ9WrgwBmj/",
  email: "abdulrahman.mo.abdulfattah@gmail.com",
  discord: "xabdomo",
};

export const CV_PATH = "/my_cv.pdf";

/** Section anchors used by the navigation. */
export const SECTIONS = {
  about: "about",
  timeline: "timeline",
  projects: "projects",
  skills: "skills",
  github: "github",
  contact: "contact",
} as const;
