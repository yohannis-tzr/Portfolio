// All portfolio content lives here — edit this file to update the site.

import farmKeeperImg from './assets/projects/farm-keeper.webp'
import habeshaIqImg from './assets/projects/habeshaiq.webp'
import matedImg from './assets/projects/mated.webp'
import pulseImg from './assets/projects/pulse.webp'

export const profile = {
  name: 'Yohannis Tadesse',
  handle: 'yohannis-tzr',
  role: 'Full-Stack & Mobile Developer',
  location: 'Ethiopia',
  tagline:
    'I build fast, reliable web apps and cross-platform mobile apps — from typed React frontends to secure Node.js APIs and Flutter clients.',
  available: true,
}

export type SkillGroup = {
  title: string
  icon: 'code' | 'layout' | 'server' | 'smartphone' | 'database' | 'wrench'
  items: string[]
}

export const skills: SkillGroup[] = [
  {
    title: 'Languages',
    icon: 'code',
    items: ['Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'Dart'],
  },
  {
    title: 'Frontend',
    icon: 'layout',
    items: ['HTML5', 'CSS3', 'React.js', 'Next.js', 'Tailwind CSS', 'Vite', 'TanStack Start'],
  },
  {
    title: 'Backend',
    icon: 'server',
    items: [
      'Node.js',
      'Hono.js',
      'Express.js',
      'REST APIs',
      'Swagger / OpenAPI',
      'Auth & Authorization',
      'OTP Verification',
    ],
  },
  {
    title: 'Mobile',
    icon: 'smartphone',
    items: ['Flutter', 'Material 3', 'go_router'],
  },
  {
    title: 'Databases',
    icon: 'database',
    items: ['PostgreSQL', 'SQL', 'Database Integration'],
  },
  {
    title: 'Tools & Platforms',
    icon: 'wrench',
    items: [
      'Git',
      'GitHub',
      'VS Code',
      'npm',
      'Vercel',
      'Postman',
      'Linux',
      'Claude Code',
      'AI-Assisted Dev Tools',
    ],
  },
]

export type Project = {
  name: string
  kind: 'Mobile App' | 'Web App'
  /** How the screenshot is framed. */
  device: 'phone' | 'browser'
  image: string
  imageAlt: string
  /** Shown in the browser frame's address bar. */
  domain?: string
  description: string
  highlights: string[]
  tags: string[]
  /** Live site / store link — leave undefined to hide the button. */
  url?: string
  /** Source code link — leave undefined to hide the button. */
  repo?: string
}

// TODO: confirm the tech tags and add live or repo links where you have them.
export const projects: Project[] = [
  {
    name: 'Farm Keeper',
    kind: 'Mobile App',
    device: 'phone',
    image: farmKeeperImg,
    imageAlt:
      'Farm Keeper home screen showing 24 active crops, 3 pending tasks, a harvest window alert and a 78% yield projection chart',
    description:
      'A Flutter farm-management app that gives farmers a calm daily snapshot of their fields — what is growing, what needs doing, and what is ready to harvest.',
    highlights: [
      'Harvest-window alerts with one-tap team scheduling',
      'Yield projection and crop distribution charts',
      'Crops, tasks, weather and profile in a Material 3 bottom nav',
    ],
    tags: ['Flutter', 'Dart', 'Material 3', 'go_router'],
  },
  {
    name: 'HabeshaIQ',
    kind: 'Web App',
    device: 'phone',
    image: habeshaIqImg,
    imageAlt:
      'HabeshaIQ home screen with Free Study and Take Paid Test categories, a 25,000 ETB prize hub, a 1v1 multiplayer lobby and an ETB wallet balance',
    description:
      'A mobile-first quiz platform where students study for free, take paid tests to earn rewards, and compete for prizes — with a built-in ETB wallet.',
    highlights: [
      'Free study mode plus paid tests that earn rewards',
      'Wallet with ETB deposits and a live balance',
      'Prize tournaments, leaderboards and 1v1 multiplayer rooms',
    ],
    tags: ['React', 'TypeScript', 'Node.js', 'PostgreSQL'],
    url: 'https://quiz-app-new-ivory.vercel.app',
  },
  {
    name: 'Mated Institute',
    kind: 'Web App',
    device: 'browser',
    image: matedImg,
    imageAlt:
      'MATED Consulting & Training homepage with the headline "Strategy that moves institutions forward" beside a photo of a trainer at a laptop',
    description:
      'The website for MATED, an Addis Ababa–based management institute delivering consulting, research and capacity-development training.',
    highlights: [
      'Editorial, trust-first layout with light and dark themes',
      'Services, experience, blog and photo gallery',
      '"Ask MATED" assistant for instant answers',
    ],
    tags: ['React', 'Tailwind CSS', 'REST APIs'],
  },
  {
    name: 'Pulse Digital',
    kind: 'Web App',
    device: 'browser',
    image: pulseImg,
    imageAlt:
      'Pulse Digital homepage with the headline "Close the gap between what you offer and how it looks online" over a purple particle wave',
    domain: 'pulsedigital.co',
    description:
      'A marketing site for a digital agency that runs websites, social media and content for businesses — built to turn visitors into booked calls.',
    highlights: [
      'Animated particle-wave hero with live activity cards',
      'Services, packages and process sections',
      'Clear "Book a Strategy Call" conversion path',
    ],
    tags: ['Next.js', 'Tailwind CSS', 'Vercel'],
  },
]

export type Contact = {
  label: string
  value: string
  href: string
  icon: 'mail' | 'send' | 'linkedin' | 'github' | 'phone'
}

export const contacts: Contact[] = [
  { label: 'Email', value: 'yotadzin@gmail.com', href: 'mailto:yotadzin@gmail.com', icon: 'mail' },
  { label: 'Telegram', value: '@yotadz', href: 'https://t.me/yotadz', icon: 'send' },
  {
    label: 'LinkedIn',
    value: 'yohannis-tadesse',
    href: 'https://www.linkedin.com/in/yohannis-tadesse-3405b41ab/',
    icon: 'linkedin',
  },
  { label: 'GitHub', value: 'yohannis-tzr', href: 'https://github.com/yohannis-tzr', icon: 'github' },
  { label: 'Phone', value: '+251 907 096 833', href: 'tel:+251907096833', icon: 'phone' },
]
