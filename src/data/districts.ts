export type DistrictId =
  | "about"
  | "academics"
  | "skills"
  | "ai"
  | "robotics"
  | "software"
  | "design"
  | "leadership"
  | "contact";

export interface DistrictLink {
  label: string;
  detail: string;
  /** Omit when the link isn't live yet (e.g. "link to be uploaded") — renders as plain text instead of an anchor. */
  href?: string;
  /** Set to force a download instead of navigating (e.g. a filename for a PDF). */
  download?: string;
}

export interface DistrictContent {
  id: DistrictId;
  /** Row (lane index) along the crossing where this district's building sits */
  row: number;
  title: string;
  eyebrow: string;
  accent: "neon" | "amber" | "magenta";
  summary: string;
  bullets: string[];
  /** Free-form key/value facts rendered as a small stat grid, optional */
  stats?: { label: string; value: string }[];
  /** Clickable link rows (used by the contact district) — takes priority over bullets when present */
  links?: DistrictLink[];
  cta?: { label: string; href: string };
}

/**
 * Single source of truth for portfolio content. Rows are spaced 6 lanes
 * apart — tune ROW spacing in game/config.ts if you change the count or
 * want denser/sparser crossings.
 *
 * The only placeholders left are the actual contact links in the "contact"
 * district at the bottom — swap those `EDIT ME` hrefs for the real ones.
 */
export const DISTRICTS: DistrictContent[] = [
  {
    id: "about",
    row: 6,
    title: "About Me",
    eyebrow: "District 01",
    accent: "neon",
    summary:
      "I'm Manveer Plaha — a student, developer, designer, and builder interested in the intersection of Artificial Intelligence, robotics, software, and creative technology.",
    bullets: [
      "Artificial Intelligence and Computer Science",
      "Robotics and physical computing",
      "Building software and hardware projects",
      "Creative technology and interactive experiences",
      "Solving real-world problems through engineering",
      "Exploring new technologies and experimenting with ideas",
      "Combining engineering, design, and storytelling",
      "Outside technology: gaming, history, astronomy, tennis, violin, poetry, and creative work",
    ],
  },
  {
    id: "academics",
    row: 12,
    title: "Academics",
    eyebrow: "District 02",
    accent: "neon",
    summary:
      "Class 12 Non-Medical (PCM) student at Sacred Heart School, Moga, following the ISC curriculum.",
    bullets: [
      "Academic interests increasingly revolve around Mathematics, Physics, Computer Science, Engineering, and Artificial Intelligence",
      "Enjoys learning beyond the classroom — exploring technologies and concepts through independent projects",
    ],
    stats: [
      { label: "Maths", value: "Core" },
      { label: "Comp. Sci", value: "Core" },
    ],
  },
  {
    id: "skills",
    row: 18,
    title: "Skills",
    eyebrow: "District 03",
    accent: "amber",
    summary:
      "Technical skills developed primarily through hands-on projects, experimentation, and building systems across software and hardware.",
    bullets: [
      "Languages: Python, Java, HTML",
      "Embedded & robotics: Arduino, ESP32, embedded systems",
      "Software: Web development, game development, Artificial Intelligence, Machine Learning, Computer Vision",
      "Creative: UI/UX design, graphic design, branding, content creation, video/reel editing, presentation design, visual communication",
    ],
  },
  {
    id: "ai",
    row: 24,
    title: "Artificial Intelligence",
    eyebrow: "District 04",
    accent: "amber",
    summary:
      "Artificial Intelligence is one of the areas I want to explore most deeply — not only the models themselves, but how intelligent systems interact with people, software, and the physical world.",
    bullets: [
      "Machine Learning",
      "Computer Vision",
      "AI-powered applications",
      "Intelligent interfaces",
      "Human-assistive AI",
      "AI + Robotics",
      "Experimental AI systems",
      "Habitax — an AI-focused project applying intelligent systems to meaningful problems, exploring how technology can help us understand and interact with the world around us",
    ],
  },
  {
    id: "robotics",
    row: 30,
    title: "Robotics",
    eyebrow: "District 05",
    accent: "neon",
    summary:
      "Robotics is where my interest in programming and engineering becomes physical — designing systems where software, electronics, sensors, control systems, and mechanical components all have to work together.",
    bullets: [
      "Project Squirrel — a weather-resilient VTOL UAV concept for humanitarian aid, focused on delivering essential supplies in challenging weather conditions",
      "NeutralSparks — an ESP32-based 4WD competition robot with multiple operating modes and real-time control",
      "Gyroscope Glove Controller — a wearable controller that uses hand movement and gyroscopic sensing to control a robotic vehicle",
      "What robotics has taught me: hardware-software integration, embedded programming, sensor-based control, problem solving, iterative prototyping, and designing for real-world constraints",
    ],
  },
  {
    id: "software",
    row: 36,
    title: "Software & Game Development",
    eyebrow: "District 06",
    accent: "magenta",
    summary:
      "I enjoy creating software that people can actually interact with rather than code that just runs in the background — web experiences, interactive interfaces, and games that combine technology with storytelling and user experience.",
    bullets: [
      "Horizon — in Grade 9, worked with a team to build a game combining programming, storytelling, and visual design; led the creative and frontend side, designing the story and UI and managing the frontend player experience",
      "What I enjoy building: interactive websites, games, user interfaces, frontend experiences, interactive visualizations, creative coding, and technology-driven experiences",
    ],
  },
  {
    id: "design",
    row: 42,
    title: "Design",
    eyebrow: "District 07",
    accent: "magenta",
    summary:
      "Technology is only one part of what I enjoy creating — I'm also deeply interested in design and visual communication, turning ideas into visuals that are clear, engaging, and distinctive.",
    bullets: [
      "Social media posts, Instagram content, event announcements",
      "Club and organization branding, posters, certificates, presentations",
      "Logos and visual identities, UI/UX interfaces, promotional graphics, digital campaigns",
      "Designed for organizations spanning AI, robotics, astronomy, cybersecurity, and technology",
      "Design is about understanding the audience, communicating an idea quickly, and creating an experience people remember",
    ],
  },
  {
    id: "leadership",
    row: 48,
    title: "Leadership, Projects & Experiences",
    eyebrow: "District 08",
    accent: "amber",
    summary:
      "My journey isn't limited to academics or individual projects — I've also taken on leadership roles across teams, design, communication, and technical work.",
    bullets: [
      "Physics Club — Coordinator, helping run activities and initiatives",
      "SynerTech — Tech Lead, leading the technical side of robotics-related work",
      "GADS (Global Affairs and Debate Society) — Design Lead, leading visual content and the organization's design identity",
      "Project Squirrel — humanitarian UAV project and Conrad Challenge work",
      "Freezengg — technology and business-related work",
      "Majic Books — wrote a book under the name Majic Books, reflecting an interest in creative writing and storytelling",
    ],
  },
  {
    id: "contact",
    row: 54,
    title: "Contact",
    eyebrow: "District 09 — Final Stop",
    accent: "neon",
    summary:
      "You've reached the final stop on CrossPath. But the journey doesn't end here — this is where the next chapter begins. Whether you're interested in a project, collaboration, AI or robotics, or simply want to connect, I'd be happy to hear from you.",
    bullets: [],
    links: [
      {
        label: "GitHub",
        detail: "Explore my code, projects, and technical work",
        href: "https://github.com/manveerplaha",
      },
      {
        label: "LinkedIn",
        detail: "Connect with me professionally",
        href: "https://linkedin.com/in/manveer-plaha-1b211832",
      },
      {
        label: "Resume",
        detail: "Open my resume — experience, projects, and achievements",
        href: "/resume.pdf",
      },
    ],
    cta: { label: "Send an email", href: "mailto:plahamanveer@gmail.com" },
  },
];

export const districtById = (id: DistrictId) => DISTRICTS.find((d) => d.id === id)!;
