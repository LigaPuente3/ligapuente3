import type { Dictionary } from "./es";

export const en: Dictionary = {
  meta: {
    description: "The {community} community league: sign up with Discord, group stage and knockout rounds.",
  },
  nav: {
    label: "Main navigation",
    home: "Home",
    help: "Help",
    changelog: "What's new",
    skipToContent: "Skip to content",
  },
  language: {
    label: "Language",
    switchTo: "Switch language to {lang}",
    names: { es: "Español", en: "English" },
  },
  home: {
    title: "The {community} league",
    tagline: "Sign up with your Discord account, play the group stage and fight for the title in the knockout rounds.",
    statusTitle: "Under construction",
    statusBody:
      "We are building the site. Very soon you will be able to sign in with Discord and register for the first tournament.",
    featuresTitle: "How it works",
    features: [
      {
        title: "Sign in with Discord",
        body: "No new passwords: we only use your Discord name and avatar.",
      },
      {
        title: "Group stage",
        body: "Round robin or groups. Standings update with every result.",
      },
      {
        title: "Knockout rounds",
        body: "The best players of the group stage move on to the final bracket until a champion is crowned.",
      },
    ],
  },
  footer: {
    unofficial:
      "Community project, unofficial: not affiliated with or endorsed by the owners of the game.",
    privacy: "Privacy",
    terms: "Terms",
    help: "Help",
    version: "Version {version}",
    sourceCode: "Open source (MIT)",
  },
  legal: {
    lastUpdated: "Last updated: {date}",
    contactFallback: "the {community} organizers, through their Discord server",
    controllerFallback: "the organizers of the {community} league",
  },
  privacy: {
    title: "Privacy policy",
    intro:
      "This page explains what personal data {site} processes, why, and how you can exercise your rights, under the General Data Protection Regulation (GDPR) and Spanish law.",
    sections: [
      {
        title: "Data controller",
        paragraphs: ["The data controller is {controller}. You can get in touch by writing to {contact}."],
      },
      {
        title: "What data we store",
        paragraphs: [
          "When you sign in with Discord we will only store your Discord ID, your display name and your avatar URL. We do not ask for your email address and Discord never shares your password with us.",
          "We also store the data you generate by taking part in the league: registrations, pairings and results.",
        ],
      },
      {
        title: "What we use it for",
        paragraphs: [
          "To identify you when you sign in, run the tournaments you register for and show pairings and standings. Your Discord name and avatar are shown publicly there.",
        ],
      },
      {
        title: "Legal basis",
        paragraphs: [
          "We process your data because it is necessary to provide the service you request when you register (Article 6.1.b GDPR) and with your consent, given when you authorize access from Discord.",
        ],
      },
      {
        title: "Where it is stored",
        paragraphs: [
          "The database is hosted by Supabase in Frankfurt (European Union). The site is served by Vercel from servers in Frankfurt; Vercel is a US company that applies the GDPR safeguards for international transfers (standard contractual clauses and the EU-US Data Privacy Framework). Sign-in is handled by Discord.",
        ],
      },
      {
        title: "Cookies",
        paragraphs: [
          "We only use technical cookies: one to remember your language (\"lang\") and, once you sign in, one to keep your session. We do not use analytics or advertising cookies.",
        ],
      },
      {
        title: "How long we keep it",
        paragraphs: [
          "For as long as you keep your account. If you delete it, we remove your personal data; results of tournaments already played may be kept without anything that identifies you, so standings are not altered.",
        ],
      },
      {
        title: "Your rights and how to delete your account",
        paragraphs: [
          "You can request access, rectification, erasure (deleting your account), restriction, objection and portability of your data by writing to {contact}. Later on you will be able to delete your account yourself from your profile.",
          "If you believe we have not handled your request properly, you can file a complaint with the Spanish Data Protection Agency (aepd.es).",
        ],
      },
      {
        title: "Changes",
        paragraphs: ["If we change this policy we will say so on this page and in the site's what's new section."],
      },
    ],
  },
  terms: {
    title: "Terms of use",
    intro: "By using {site} you accept these terms.",
    sections: [
      {
        title: "What {site} is",
        paragraphs: [
          "A free website to run the {community} community league. Nobody pays to take part.",
          "It is an unofficial community project: it is not affiliated with or endorsed by Fantasy Flight Games, Asmodee, Disney or Lucasfilm. Star Wars: Unlimited and its trademarks belong to their respective owners.",
        ],
      },
      {
        title: "Your account",
        paragraphs: [
          "You sign in with your Discord account. Use only one account per person; you are responsible for what is done with it.",
        ],
      },
      {
        title: "Fair play and respect",
        paragraphs: [
          "Report truthful results and treat other players with respect. Organizers may correct results, disqualify or block accounts that break these rules or the tournament's rules.",
        ],
      },
      {
        title: "Public information",
        paragraphs: ["Your Discord name and avatar are shown in registrations, pairings and standings."],
      },
      {
        title: "Availability",
        paragraphs: ["The site is provided as is, without warranties. It may change, have bugs or stop being available."],
      },
      {
        title: "Governing law and contact",
        paragraphs: ["These terms are governed by Spanish law. For any question, write to {contact}."],
      },
    ],
  },
  help: {
    title: "Help",
    intro: "Everything you need to take part in the {community} league.",
    sections: [
      {
        title: "What is {site}?",
        paragraphs: [
          "The site where you register for the {community} league tournaments, check pairings and standings and follow the knockout rounds.",
        ],
      },
      {
        title: "How to sign in",
        paragraphs: [
          "Very soon you will be able to sign in with your Discord account. We will only use your ID, name and avatar; never your email or password.",
        ],
      },
      {
        title: "Language",
        paragraphs: [
          "You can switch between Spanish and English with the selector in the header. The site remembers your choice in this browser.",
        ],
      },
      {
        title: "Questions or problems?",
        paragraphs: ["Write to the organizers on the {community} Discord server or to {contact}."],
      },
    ],
  },
  changelog: {
    title: "What's new",
    intro: "Change history of {site}.",
  },
  notFound: {
    title: "Page not found",
    body: "The page you are looking for does not exist or has moved.",
    back: "Back to home",
  },
};
