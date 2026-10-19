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
    tournaments: "Tournaments",
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
    registrations: "Your registrations",
    noRegistrations: "You are not registered for any tournament.",
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
    tournamentsLink: "Manage tournaments and registrations",
    achievementsLink: "Assign \"Liga Puente 3\" to players",
    leagueWins: {
      title: "Liga Puente 3 winners",
      intro:
        "Players cannot mark this achievement themselves. Enter here how many editions each one has won (for example, the ones before this site). Editions played here will be added automatically when they finish.",
      label: "Editions won by {name}",
      saved: "Saved.",
      invalid: "Use a whole number from 0 to 99.",
      failed: "It could not be saved. Please try again.",
    },
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
            "Moderator: the same as a player plus access to this panel to help with matches: pairings and brackets, and entering, confirming and correcting results; they also assign the \"Liga Puente 3\" achievement. They do not create tournaments, assign divisions or change roles.",
            "Admin: can do everything: create and manage tournaments and divisions, review registrations, appoint moderators and admins, and everything a moderator does. Admins can also play.",
            "Accounts whose Discord ID is in the ADMIN_DISCORD_IDS variable in Vercel are permanent admins and cannot be changed from the site. Nobody can change their own role.",
          ],
        },
        {
          title: "Tournaments and registrations",
          paragraphs: [
            "Each edition is created in Admin → Manage tournaments and registrations. It starts as \"Draft\" (only admins can see it); once \"Published\" everyone can see it. Registration is opened and closed with its checkbox, and can stay open while the tournament is \"In progress\" so people can join the Common division.",
            "The tournament page lists every registration with its answers, including city and country (admins only). Only draft tournaments can be deleted.",
            "To require membership of the community Discord server, set its ID in the DISCORD_GUILD_ID variable in Vercel (and, optionally, an invite link in DISCORD_GUILD_INVITE_URL). The check happens when signing in.",
          ],
        },
        {
          title: "Divisions, groups and results",
          paragraphs: [
            "On the tournament admin page → \"Divisions and groups\": assign each registered player a division and, for each division, enter the number of groups and press \"Draw groups and create matches\". Players are randomly split into balanced groups and the round-robin matches are created.",
            "If someone registers late (e.g. in the Common division), assign their division and add them to a group: their matches against the rest are created. Someone can only be removed from a group, or a division draw undone, while there are no results.",
            "Players enter their results while the tournament is \"In progress\" (either player of the match). Moderators and admins see, on the public tournament page, a selector on each match to set, correct or clear a result, or mark it as \"Not played\" (it does not count in the standings).",
            "Someone already in a group cannot withdraw by themselves: if they leave the league, mark their pending matches as \"Not played\".",
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
  tournaments: {
    title: "Tournaments",
    intro: "Editions of the {community} league.",
    empty: "No tournaments have been published yet.",
    status: { DRAFT: "Draft", PUBLISHED: "Published", IN_PROGRESS: "In progress", FINISHED: "Finished" },
    registrationOpen: "Registration open",
    registrationClosed: "Registration closed",
    startsOn: "Starts",
    deadline: "Deadline to play the group stage",
    rules: "Tournament rules",
    players: "Registered ({count})",
    noPlayers: "Nobody has registered yet.",
    register: "Register",
    editRegistration: "Edit my registration",
    unregister: "Withdraw",
    unregisterConfirm: "I confirm I want to withdraw",
    youAreRegistered: "You are registered for this tournament.",
    signInToRegister: "Sign in with Discord to register.",
    guildNotMember:
      "To register you must be a member of the {community} Discord server. Join the server, sign out and sign in again.",
    guildUnknown:
      "We could not check whether you are a member of the {community} Discord server. Sign out and sign in again to check.",
    joinGuild: "Join the Discord server",
    registered: "Registration saved!",
    unregistered: "You have withdrawn from the tournament.",
    notOpen: "Registration for this tournament is not open.",
    viewAll: "See all tournaments",
    form: {
      title: "Registration: {name}",
      intro: "Fill in the form to register. Your Discord name is taken from your account.",
      previousParticipation: "Did you take part in the previous edition of the league?",
      participation: {
        LAST_EDITION: "Yes",
        FIRST_TIME: "No, this is my first time",
        EARLIER_EDITIONS: "No, but I played earlier editions",
      },
      firstTimeBigWin: "If this is your first time: have you won a PQ, a Sector or a Regional?",
      streamingConsent:
        "Do you allow your matches to be streamed on the {community} YouTube channel or by other creators, as long as you are asked first?",
      yes: "Yes",
      no: "No",
      city: "City",
      country: "Country",
      locationNote: "City and country are only visible to admins, to know where people play from.",
      rulesAccepted: "I have read and accept the tournament rules",
      rulesLink: "Read the rules",
      submit: "Save registration",
      cancel: "Cancel",
      errors: {
        required: "This field is required.",
        too_long: "It is too long.",
        invalid: "Invalid value.",
        form: "Please check the highlighted fields.",
      },
    },
  },
  adminTournaments: {
    title: "Tournaments",
    intro: "Create and manage the league editions and review registrations.",
    new: "New tournament",
    edit: "Edit tournament",
    empty: "There are no tournaments yet.",
    name: "Name",
    description: "Description (optional)",
    rulesUrl: "Link to the rules (https://…, optional)",
    startsOn: "Start date (optional)",
    matchDeadlineOn: "Deadline to play the group stage (optional)",
    status: "Status",
    statusHelp:
      "Draft: only admins can see it. Published: visible to everyone. In progress: the group stage has started. Finished: closed edition.",
    registrationOpen: "Registration open",
    registrationHelp: "It can stay open while the tournament is in progress, so people can join the Common division.",
    promotions: "Promoted per division",
    relegations: "Relegated per division",
    save: "Save",
    saved: "Tournament saved.",
    publicLink: "See public page",
    registrations: "Registrations ({count})",
    noRegistrations: "No registrations yet.",
    columns: {
      player: "Player",
      previous: "Previous edition",
      firstTimeBigWin: "PQ/Sector/Regional",
      streaming: "Streaming",
      location: "City and country",
      date: "Date",
    },
    delete: "Delete tournament",
    deleteHint: "Only draft tournaments can be deleted. Their registrations are deleted too.",
    deleteConfirm: "I confirm I want to delete this tournament",
    deleted: "Tournament deleted.",
    errors: {
      required: "This field is required.",
      too_short: "It is too short.",
      too_long: "It is too long.",
      invalid: "Invalid value.",
      invalid_url: "It must be a link starting with https://",
      form: "Please check the highlighted fields.",
      not_draft: "Only draft tournaments can be deleted.",
    },
  },
  achievements: {
    title: "Achievements",
    intro:
      "Enter how many times you have won each tournament (0 if never). They are shown next to your name on your profile and, later on, in the standings. Liga Puente 3 🏆 is not set here: it is added when you win it on this site or assigned by moderators.",
    names: { GALACTIC: "Galactic", REGIONAL: "Regional", SECTOR: "Sector", PQ: "PQ", LIGA_PUENTE3: "Liga Puente 3" },
    winsOf: "Times you have won: {name}",
    save: "Save achievements",
    saved: "Achievements saved.",
    invalid: "Use whole numbers from 0 to 99.",
    none: "No achievements yet.",
  },
  league: {
    title: "Group stage",
    divisions: { LEGENDARY: "Legendary", RARE: "Rare", UNCOMMON: "Uncommon", COMMON: "Common" },
    groupName: "{division} {number}",
    tierLetters: { LEGENDARY: "L", RARE: "R", UNCOMMON: "U", COMMON: "C" },
    zones: {
      champion: "Top of Legendary",
      promotion: "Promoted to {division}",
      relegation: "Relegated to {division}",
    },
    noGroups: "Groups have not been drawn yet.",
    columns: { position: "#", player: "Player", played: "P", won: "W", drawn: "D", lost: "L", games: "Games", points: "Pts" },
    columnsLong: {
      played: "Matches played",
      won: "Won",
      drawn: "Drawn",
      lost: "Lost",
      games: "Games won and lost",
      points: "Points",
    },
    rules: "Win 3 points, loss 0. Tiebreakers: games won, head-to-head and game difference.",
    matches: "Matches ({played} of {total} played)",
    pending: "Pending",
    notPlayed: "Not played",
    deletedPlayer: "Deleted account",
    vs: "vs",
    myMatches: "Your matches",
    myPendingCount: "You have {count} left to play.",
    youWon: "won",
    youLost: "lost",
    draw: "draw",
    reportConfirm: "Save {score} against {rival}? Afterwards only a moderator or an admin can change it.",
    reportConfirmYes: "Yes, save",
    reportConfirmNo: "Change",
    reportInvalid: "Invalid result: best of 3, one of you must reach 2 (2-0, 2-1, 1-2 or 0-2).",
    reportOwn: "Your games",
    reportRival: "Rival's games",
    reportSave: "Save result",
    reportHint:
      "Best of 3: one of you must reach 2 (2-0, 2-1, 1-2 or 0-2). There are no draws. Either player can enter it. Once saved, only a moderator or an admin can change it: if something is wrong, tell them.",
    moderatorResult: "Result (moderation)",
    moderatorOptions: { PENDING: "Pending", NOT_PLAYED: "Not played" },
    save: "Save",
    resultSaved: "Result saved.",
    resultNotAllowed: "That result could not be saved.",
    inGroupNoWithdraw: "You are already in a group-stage group: to withdraw, talk to a moderator.",
  },
  adminGroups: {
    title: "Divisions and groups",
    intro: "Assign each registered player a division and draw the groups. Drawing creates the round-robin matches.",
    link: "Divisions and groups",
    unassigned: "Registered without a division ({count})",
    allAssigned: "Every registered player has a division.",
    noDivision: "No division",
    assign: "Save",
    changeDivision: "See the players and change their division",
    playerCount: "{count} players",
    groupCount: "Number of groups",
    draw: "Draw groups and create matches",
    drawHint: "Players are randomly split into balanced groups, with at least 2 players per group.",
    notInGroup: "No group in this division",
    addTo: "Add to",
    add: "Add",
    remove: "Remove",
    removeHint: "Someone can only be removed if they have no matches with a result; their pending matches are deleted.",
    reset: "Undo the draw",
    resetHint: "Only while there are no results yet. Deletes this division's groups and matches.",
    resetConfirm: "I confirm I want to undo the draw",
    status: {
      saved: "Saved.",
      drawn: "Groups drawn and matches created.",
      reset: "Draw undone.",
      added: "Player added to the group, with their matches.",
      removed: "Player removed from the group.",
      invalid: "Invalid data.",
      in_group: "That player is already in a group: remove them first.",
      already_drawn: "That division has already been drawn.",
      too_few_players: "At least 2 players per group are needed.",
      has_results: "There are matches with a result: it cannot be done.",
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
          "When you register for a tournament we store your answers: whether you played the previous edition, whether you have won a PQ, Sector or Regional, whether you allow your matches to be streamed, your city and country (only admins can see these two) and when you accepted the rules.",
          "If the league requires membership of its Discord server, when you sign in we also ask permission to check it (\"guilds.members.read\" scope) and we only store whether you are a member or not.",
          "The achievements you enter on your profile (tournaments won) are shown publicly next to your name.",
          "We also store the data you generate by taking part in the league: pairings and results.",
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
        title: "Tournaments and registration",
        paragraphs: [
          "Under \"Tournaments\" you will find the league editions. If registration is open, press \"Register\", fill in the form and accept the rules. While it stays open you can edit your registration or withdraw from the tournament page.",
          "If the league requires membership of the {community} Discord server and you are not a member, join the server, sign out and sign in again.",
        ],
      },
      {
        title: "Group stage and results",
        paragraphs: [
          "Admins assign you a division (Legendary, Rare, Uncommon or Common) and the groups are drawn. In each group you play everyone, best of 3, within the tournament deadline.",
          "When you finish a match, go to the tournament page and, under \"Your pending matches\", choose your games and your rival's (0, 1 or 2) and press \"Save result\". Either player can enter it. You are asked to confirm before saving: afterwards only a moderator or an admin can change it, so if something is wrong, tell them.",
          "Standings: win 3 points, loss 0. Tiebreakers: games won, head-to-head and game difference.",
        ],
      },
      {
        title: "Achievements",
        paragraphs: [
          "On your profile you can enter how many times you have won a Galactic, a Regional, a Sector or a PQ. They appear as icons next to your name.",
          "You cannot set Liga Puente 3 🏆 yourself: it is added when you win it on this site, and earlier editions are assigned by moderators.",
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
