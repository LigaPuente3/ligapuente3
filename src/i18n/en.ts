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
      "You can now sign in with your Discord account. Very soon you will be able to register for the first tournament.",
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
  auth: {
    signIn: "Sign in",
    signOut: "Sign out",
    signInWithDiscord: "Sign in with Discord",
    admin: "Admin",
    profile: "Profile",
    userMenu: "Your account",
    loginTitle: "Sign in",
    loginIntro: "Sign in with your Discord account to take part in the {community} league.",
    loginPrivacy:
      "We only ask Discord for your ID, name and avatar (\"identify\" scope). Never your email or password.",
    loginError: "Signing in with Discord failed. Please try again.",
    alreadySignedIn: "You are signed in as {name}.",
  },
  forbidden: {
    title: "No permission",
    body: "Your account is not allowed to see this page.",
    back: "Back to home",
  },
  roles: { PLAYER: "Player", MODERATOR: "Moderator", ADMIN: "Admin" },
  stage: {
    badge: "Alpha",
    notice: "Alpha version: the site is being tested and may change or have bugs. Data may be reset.",
  },
  profile: {
    title: "Your profile",
    discordId: "Discord ID",
    role: "Role",
    memberSince: "Account created",
    deleteTitle: "Delete my account",
    deleteBody:
      "Your account and personal data will be deleted from {site}. If you sign in with Discord again, a new account will be created. This cannot be undone.",
    deleteConfirm: "I understand my account will be deleted and this cannot be undone.",
    deleteButton: "Delete my account",
    deleteError: "The account could not be deleted. Please try again or write to {contact}.",
    deleted: "Your account has been deleted.",
  },
  admin: {
    title: "Admin",
    intro: "{site} admin panel. Moderators and admins can see it.",
    usersTitle: "Users",
    stats: { total: "Total", PLAYER: "Players", MODERATOR: "Moderators", ADMIN: "Admins" },
    statsError: "The data could not be loaded. Please try again later.",
    comingSoonTitle: "Coming soon",
    comingSoonBody: "Tournaments, registrations, divisions, group stage and knockout rounds.",
    docsLink: "Admin documentation",
    usersLink: "Manage users and roles",
    users: {
      title: "Users and roles",
      intro: "Admins can appoint moderators and other admins. Changes can take up to 5 minutes to apply.",
      search: "Search by name or Discord ID",
      searchButton: "Search",
      empty: "No matching users.",
      name: "User",
      role: "Role",
      save: "Save",
      you: "You",
      configAdmin: "Admin by configuration",
      previous: "Previous",
      next: "Next",
      page: "Page {page} of {pages}",
      saved: "Role updated.",
      errors: {
        not_allowed: "You are not allowed to change roles.",
        self: "You cannot change your own role.",
        config_admin: "This admin is set in the configuration (ADMIN_DISCORD_IDS) and cannot be changed here.",
        invalid_role: "Invalid role.",
        not_found: "The user does not exist.",
        failed: "It could not be saved. Please try again.",
      },
    },
    docs: {
      title: "Admin documentation",
      intro: "How {site} is managed. Alpha version: roles and their permissions may change.",
      sections: [
        {
          title: "Roles",
          paragraphs: [
            "There are three roles. Every account is a player when it first signs in.",
            "Player: registers for tournaments, plays their matches and can delete their account from their profile.",
            "Moderator: the same as a player plus access to this panel to help with matches: pairings and brackets, and entering, confirming and correcting results. They do not create tournaments, assign divisions or change roles.",
            "Admin: can do everything: create and manage tournaments and divisions, review registrations, appoint moderators and admins, and everything a moderator does. Admins can also play.",
            "Accounts whose Discord ID is in the ADMIN_DISCORD_IDS variable in Vercel are permanent admins and cannot be changed from the site. Nobody can change their own role.",
          ],
        },
        {
          title: "How to change someone's role",
          paragraphs: [
            "The person must have signed in with Discord at least once. Then, in Admin → Manage users and roles, find them, choose the role and press Save. The change can take up to 5 minutes to apply.",
          ],
        },
        {
          title: "How to get a Discord ID",
          paragraphs: [
            "In Discord: User Settings → Developer (or Advanced) → turn on Developer Mode. Then click (or right-click) the user → Copy User ID.",
          ],
        },
        {
          title: "Service status",
          paragraphs: [
            "The /api/health address shows the region the site runs in (it must be fra1, Frankfurt), the time, the last applied migration and the database response time (it should be a few milliseconds).",
            "A daily Vercel cron queries the database so Supabase does not pause the project for inactivity.",
          ],
        },
        {
          title: "Database and migrations",
          paragraphs: [
            "Database structure changes are applied by hand in the Supabase SQL Editor, first in development and then in production, following docs/MIGRACIONES.md in the repository.",
          ],
        },
        {
          title: "Personal data and account deletion",
          paragraphs: [
            "Everyone can delete their account from their profile. If someone asks another way, delete their row in the users table in the SQL Editor (their sessions and linked Discord account are deleted automatically): DELETE FROM users WHERE discord_id = '…';",
          ],
        },
        {
          title: "Handover",
          paragraphs: ["Services, environment variables and keys to rotate are listed in docs/TRANSFERENCIA.md in the repository."],
        },
      ],
    },
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
          "When you sign in with Discord we only store your Discord ID, your display name and your avatar URL. We do not ask for your email address (internally a placeholder derived from your ID is stored) and Discord never shares your password with us. We do not store Discord access tokens.",
          "While your session is open we store, for security, the IP address and browser you signed in from; they are deleted when the session ends or expires.",
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
          "You can request access, rectification, erasure (deleting your account), restriction, objection and portability of your data by writing to {contact}. You can delete your account yourself at any time from your profile. You can also revoke {site}'s access in Discord: User Settings → Authorized Apps.",
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
          "Press \"Sign in\" in the header and then \"Sign in with Discord\". Discord will ask you to authorize {site}: we only share your ID, name and avatar; never your email or password.",
          "To leave, press \"Sign out\" in the header. Your name and avatar are refreshed every time you sign in.",
        ],
      },
      {
        title: "Your profile and how to delete your account",
        paragraphs: [
          "Press your name in the header to see your profile. At the bottom there is \"Delete my account\": tick the confirmation box and press the button. Your account and personal data are deleted.",
        ],
      },
      {
        title: "Alpha version",
        paragraphs: [
          "{site} is being tested: it may change, have bugs and its data may be reset. If something looks wrong, let the organizers know.",
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
