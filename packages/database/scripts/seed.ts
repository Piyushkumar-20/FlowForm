import "dotenv/config";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { db, inArray, eq } from "../index";
import { usersTable } from "../models/user";
import { formsTable } from "../models/form";
import { formFieldTable } from "../models/form-fields";
import { formSubmissionTable } from "../models/form-submission";
import type { FormSubmissionValue } from "../models/form-submission";

/* ─────────────────────────────────────────────────────────── helpers ── */

const DEMO_EMAILS = ["admin@formflow.dev", "demo@formflow.dev"];
const NOW = Date.now();
const DAY_MS = 86_400_000;

function hashPassword(salt: string, password: string) {
  return createHmac("sha256", salt).update(password).digest("hex");
}

function makeSalt() {
  return randomBytes(16).toString("hex");
}

/** Random int in [min, max] inclusive. */
function ri(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Pick n unique random items from arr. */
function pickN<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy.slice(0, Math.min(n, copy.length));
}

/** Weighted random pick from arr (higher index = lower weight by default). */
function pickWeighted<T>(arr: T[], weights: number[]): T {
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) {
    r -= weights[i]!;
    if (r <= 0) return arr[i]!;
  }
  return arr[arr.length - 1]!;
}

/** Random timestamp within the last `days` days, clustered realistically. */
function randomTs(days = 14): Date {
  const offset = Math.floor(Math.random() ** 1.4 * days * DAY_MS);
  const hourJitter = ri(6, 22) * 3_600_000;
  return new Date(NOW - offset + hourJitter - ri(0, 3_600_000));
}

function labelKey(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "_").slice(0, 100);
}

/* ─────────────────────────────────────────────────────── form catalog ── */

type FieldDef = {
  id: string;
  label: string;
  type: "TEXT" | "YES_NO" | "NUMBER" | "EMAIL" | "PASSWORD" | "SELECT" | "CHECKBOX" | "RATING" | "DATE";
  description?: string;
  placeholder?: string;
  isRequired: boolean;
  options?: string[];
  page: number;
  conditionFieldId?: string;
  conditionOperator?: "equals" | "not_equals" | "contains" | "is_empty" | "is_not_empty";
  conditionValue?: string;
};

type FormDef = {
  id: string;
  title: string;
  description: string;
  slug: string;
  maxResponses?: number;
  expiresAt?: Date;
  fields: FieldDef[];
  submissionCount: number;
  makeSubmission: (fields: FieldDef[]) => FormSubmissionValue[];
};

/* ── 1. Anime Fan Survey ──────────────────────────────────────────────── */

const animeFanSurveyId = randomUUID();

const f_anime_rating = randomUUID();
const f_anime_genres = randomUUID();
const f_anime_finished = randomUUID();
const f_anime_completed = randomUUID();
const f_anime_archetype = randomUUID();
const f_anime_startdate = randomUUID();
const f_anime_feedback = randomUUID();

const animeFanSurvey: FormDef = {
  id: animeFanSurveyId,
  title: "Anime Fan Survey",
  description: "Tell us about your anime season experience — rankings, genres, and community vibes.",
  slug: "anime-fan-survey",
  fields: [
    {
      id: f_anime_rating,
      label: "Rate this anime season overall",
      type: "RATING",
      isRequired: true,
      page: 1,
    },
    {
      id: f_anime_genres,
      label: "Which genres did you enjoy this season?",
      type: "CHECKBOX",
      isRequired: true,
      options: ["Action", "Isekai", "Romance", "Slice of Life", "Mystery", "Mecha", "Horror"],
      page: 1,
    },
    {
      id: f_anime_finished,
      label: "Did you finish any series this season?",
      type: "YES_NO",
      isRequired: true,
      page: 1,
    },
    {
      id: f_anime_completed,
      label: "Which series did you complete?",
      type: "SELECT",
      isRequired: false,
      options: ["Frieren: Beyond Journey's End", "Dungeon Meshi", "Solo Leveling", "Blue Box", "Mushoku Tensei S2"],
      page: 1,
      conditionFieldId: f_anime_finished,
      conditionOperator: "equals",
      conditionValue: "true",
    },
    {
      id: f_anime_archetype,
      label: "Favorite character archetype",
      type: "SELECT",
      isRequired: true,
      options: ["The Stoic Hero", "The Tsundere", "The Cheerful Idiot", "The Wise Mentor", "The Rival"],
      page: 2,
    },
    {
      id: f_anime_startdate,
      label: "When did you start watching anime?",
      type: "DATE",
      isRequired: false,
      page: 2,
    },
    {
      id: f_anime_feedback,
      label: "Any shoutouts to the community?",
      type: "TEXT",
      placeholder: "Share anything...",
      isRequired: false,
      page: 2,
    },
  ],
  submissionCount: 18,
  makeSubmission(fields) {
    const finishedSeries = Math.random() > 0.3;
    const ratingWeights = [1, 2, 4, 6, 7];
    return fields.map((f) => {
      let value: FormSubmissionValue["value"] = null;
      if (f.id === f_anime_rating)   value = pickWeighted([1, 2, 3, 4, 5], ratingWeights);
      if (f.id === f_anime_genres)   value = JSON.stringify(pickN(f.options!, ri(1, 4)));
      if (f.id === f_anime_finished) value = finishedSeries;
      if (f.id === f_anime_completed) value = finishedSeries ? f.options![ri(0, f.options!.length - 1)]! : null;
      if (f.id === f_anime_archetype) value = f.options![ri(0, f.options!.length - 1)]!;
      if (f.id === f_anime_startdate) {
        const yr = ri(2012, 2022);
        value = `${yr}-0${ri(1, 9)}-${String(ri(1, 28)).padStart(2, "0")}`;
      }
      if (f.id === f_anime_feedback) {
        const msgs = [
          "Frieren is an absolute masterpiece.", "Dungeon Meshi changed how I see food.",
          "Solo Leveling hype was real!", "This season had so much variety.", null,
          "The animation quality this year was insane.", null, "Can't wait for next season.",
          "Romance watchers ate well this season.", null,
        ];
        value = msgs[ri(0, msgs.length - 1)] ?? null;
      }
      return { formFieldId: f.id, value };
    });
  },
};

/* ── 2. Startup Feedback ─────────────────────────────────────────────── */

const startupFeedbackId = randomUUID();

const f_startup_rating    = randomUUID();
const f_startup_usecase   = randomUUID();
const f_startup_features  = randomUUID();
const f_startup_recommend = randomUUID();
const f_startup_improve   = randomUUID();

const startupFeedback: FormDef = {
  id: startupFeedbackId,
  title: "Startup Feedback",
  description: "Help us build a better product. Honest feedback from real users shapes our roadmap.",
  slug: "startup-feedback",
  fields: [
    {
      id: f_startup_rating,
      label: "Rate your overall experience",
      type: "RATING",
      isRequired: true,
      page: 1,
    },
    {
      id: f_startup_usecase,
      label: "What is your primary use case?",
      type: "SELECT",
      isRequired: true,
      options: ["Market Research", "Customer Feedback", "Event Registration", "Lead Generation", "Internal Surveys"],
      page: 1,
    },
    {
      id: f_startup_features,
      label: "Which features do you use most?",
      type: "CHECKBOX",
      isRequired: false,
      options: ["Form Builder", "Analytics Dashboard", "CSV Export", "QR Code Sharing", "Conditional Logic", "Multi-page Forms"],
      page: 1,
    },
    {
      id: f_startup_recommend,
      label: "Would you recommend FlowForm to a colleague?",
      type: "YES_NO",
      isRequired: true,
      page: 1,
    },
    {
      id: f_startup_improve,
      label: "What's one thing we could do better?",
      type: "TEXT",
      placeholder: "Your honest take...",
      isRequired: false,
      page: 1,
    },
  ],
  submissionCount: 15,
  makeSubmission(fields) {
    const ratingWeights = [1, 2, 4, 7, 6];
    const improvements = [
      "More chart types in analytics.", "Faster form loading on mobile.", null,
      "Dark mode toggle in public forms.", "Webhook integrations would be huge.", null,
      "Email notifications for new responses.", "Better import from Google Forms.",
      "Custom domain support.", null, "The UX is already great, just keep going!",
    ];
    return fields.map((f) => {
      let value: FormSubmissionValue["value"] = null;
      if (f.id === f_startup_rating)    value = pickWeighted([1, 2, 3, 4, 5], ratingWeights);
      if (f.id === f_startup_usecase)   value = f.options![ri(0, f.options!.length - 1)]!;
      if (f.id === f_startup_features)  value = JSON.stringify(pickN(f.options!, ri(1, 4)));
      if (f.id === f_startup_recommend) value = Math.random() > 0.15;
      if (f.id === f_startup_improve)   value = improvements[ri(0, improvements.length - 1)] ?? null;
      return { formFieldId: f.id, value };
    });
  },
};

/* ── 3. Gaming Tournament Registration (multi-page) ─────────────────── */

const gamingTournamentId = randomUUID();

const f_game_tag      = randomUUID();
const f_game_game     = randomUUID();
const f_game_rank     = randomUUID();
const f_game_hardware = randomUUID();
const f_game_hasteam  = randomUUID();
const f_game_teamname = randomUUID();
const f_game_date     = randomUUID();
const f_game_modes    = randomUUID();

const gamerTags = [
  "ShadowStrike99", "NeonViper", "CrypticAce", "VoidWalker", "PixelRaider",
  "GhostSync", "IronClaw", "StarlightX", "ThunderByte", "PhantomEdge",
  "BlazeFury", "CelestialG", "ZeroGravity", "NightShift", "ArcLancer",
];

const gamingTournament: FormDef = {
  id: gamingTournamentId,
  title: "Gaming Tournament",  // varchar(20) limit
  description: "Sign up for our next online tournament. All skill levels welcome — glory awaits.",
  slug: "gaming-tournament-reg",
  maxResponses: 64,
  expiresAt: new Date(NOW + 21 * DAY_MS),
  fields: [
    { id: f_game_tag,      label: "Gamer Tag / Username", type: "TEXT",     isRequired: true,  page: 1, placeholder: "Your in-game name" },
    { id: f_game_game,     label: "Primary game",          type: "SELECT",   isRequired: true,  page: 1, options: ["Valorant", "CS2", "Apex Legends", "Fortnite", "League of Legends"] },
    { id: f_game_rank,     label: "Current rank",          type: "SELECT",   isRequired: true,  page: 1, options: ["Iron / Bronze", "Silver / Gold", "Platinum / Diamond", "Masters", "Grandmaster / Radiant"] },
    { id: f_game_hardware, label: "Rate your hardware setup", type: "RATING", isRequired: true, page: 1 },
    { id: f_game_hasteam,  label: "Are you joining with a pre-made team?", type: "YES_NO", isRequired: true, page: 2 },
    {
      id: f_game_teamname,
      label: "Team name",
      type: "TEXT",
      isRequired: false,
      page: 2,
      placeholder: "e.g. Team Phantom",
      conditionFieldId: f_game_hasteam,
      conditionOperator: "equals",
      conditionValue: "true",
    },
    { id: f_game_date,  label: "Preferred tournament date", type: "DATE",     isRequired: true,  page: 2 },
    { id: f_game_modes, label: "Which modes do you play?",   type: "CHECKBOX", isRequired: true, page: 2, options: ["Ranked", "Casual", "Scrimmages", "Custom Lobbies"] },
  ],
  submissionCount: 20,
  makeSubmission(fields) {
    const hasTeam = Math.random() > 0.45;
    const hwWeights = [1, 2, 5, 8, 4];
    const teamNames = ["Team Phantom", "NeonPulse", "Arctic Wolves", "Steel Syndicate", "Digital Phantoms", "Vortex Squad"];
    const futureDays = ri(5, 25);
    const tourneyDate = new Date(NOW + futureDays * DAY_MS);
    const dateStr = tourneyDate.toISOString().split("T")[0]!;
    return fields.map((f) => {
      let value: FormSubmissionValue["value"] = null;
      if (f.id === f_game_tag)      value = gamerTags[ri(0, gamerTags.length - 1)]! + ri(10, 99);
      if (f.id === f_game_game)     value = f.options![ri(0, f.options!.length - 1)]!;
      if (f.id === f_game_rank)     value = pickWeighted(f.options!, [3, 5, 5, 3, 2]);
      if (f.id === f_game_hardware) value = pickWeighted([1, 2, 3, 4, 5], hwWeights);
      if (f.id === f_game_hasteam)  value = hasTeam;
      if (f.id === f_game_teamname) value = hasTeam ? teamNames[ri(0, teamNames.length - 1)]! : null;
      if (f.id === f_game_date)     value = dateStr;
      if (f.id === f_game_modes)    value = JSON.stringify(pickN(f.options!, ri(1, 3)));
      return { formFieldId: f.id, value };
    });
  },
};

/* ── 4. Event RSVP ───────────────────────────────────────────────────── */

const eventRsvpId = randomUUID();

const f_rsvp_attending   = randomUUID();
const f_rsvp_guests      = randomUUID();
const f_rsvp_dietary     = randomUUID();
const f_rsvp_session     = randomUUID();
const f_rsvp_date        = randomUUID();
const f_rsvp_excitement  = randomUUID();

const eventRsvp: FormDef = {
  id: eventRsvpId,
  title: "Event RSVP",
  description: "Let us know if you're coming! RSVP closes 48 hours before the event.",
  slug: "event-rsvp",
  maxResponses: 100,
  expiresAt: new Date(NOW + 30 * DAY_MS),
  fields: [
    { id: f_rsvp_attending,  label: "Will you be attending?",    type: "YES_NO",   isRequired: true, page: 1 },
    {
      id: f_rsvp_guests,
      label: "How many guests are you bringing?",
      type: "SELECT",
      isRequired: false,
      options: ["Just me", "1 guest", "2 guests", "3+ guests"],
      page: 1,
      conditionFieldId: f_rsvp_attending,
      conditionOperator: "equals",
      conditionValue: "true",
    },
    { id: f_rsvp_dietary,    label: "Dietary requirements",      type: "CHECKBOX", isRequired: true,  page: 1, options: ["No restrictions", "Vegetarian", "Vegan", "Gluten-Free", "Halal", "Nut Allergy"] },
    { id: f_rsvp_session,    label: "Preferred session",          type: "SELECT",   isRequired: true,  page: 1, options: ["Morning (9AM–12PM)", "Afternoon (1PM–5PM)", "Evening (6PM–9PM)"] },
    { id: f_rsvp_date,       label: "Best date for you",          type: "DATE",     isRequired: true,  page: 1 },
    { id: f_rsvp_excitement, label: "How excited are you? (1–5)", type: "RATING",   isRequired: true,  page: 1 },
  ],
  submissionCount: 14,
  makeSubmission(fields) {
    const attending = Math.random() > 0.2;
    const excitementWeights = [1, 1, 3, 5, 8];
    const futureDays = ri(3, 28);
    const bestDate = new Date(NOW + futureDays * DAY_MS).toISOString().split("T")[0]!;
    return fields.map((f) => {
      let value: FormSubmissionValue["value"] = null;
      if (f.id === f_rsvp_attending)  value = attending;
      if (f.id === f_rsvp_guests)     value = attending ? f.options![ri(0, f.options!.length - 1)]! : null;
      if (f.id === f_rsvp_dietary)    value = JSON.stringify(pickN(f.options!, ri(1, 2)));
      if (f.id === f_rsvp_session)    value = pickWeighted(f.options!, [3, 5, 4]);
      if (f.id === f_rsvp_date)       value = bestDate;
      if (f.id === f_rsvp_excitement) value = pickWeighted([1, 2, 3, 4, 5], excitementWeights);
      return { formFieldId: f.id, value };
    });
  },
};

/* ── 5. Movie Ranking Poll ───────────────────────────────────────────── */

const moviePollId = randomUUID();

const f_movie_genre     = randomUUID();
const f_movie_films     = randomUUID();
const f_movie_rating    = randomUUID();
const f_movie_theater   = randomUUID();
const f_movie_frequency = randomUUID();
const f_movie_review    = randomUUID();
const f_movie_lastwatch = randomUUID();

const movieReviews = [
  "Dune Part Two was visually stunning — a must-watch on IMAX.", null,
  "Inside Out 2 genuinely made me tear up. Pixar is back.", null,
  "Deadpool & Wolverine was pure fan service in the best way.",
  "Alien Romulus was the scary space film we needed.", null,
  "Twisters surprised me, better than I expected.", null,
  "This year belonged to sequels, and most of them delivered.",
  "Need more sci-fi originals, not just franchises.", null,
];

const moviePoll: FormDef = {
  id: moviePollId,
  title: "Movie Ranking Poll",
  description: "Vote for the best films of the year and tell us what you really thought.",
  slug: "movie-ranking-poll",
  fields: [
    { id: f_movie_genre,     label: "Favorite movie genre",          type: "SELECT",   isRequired: true,  page: 1, options: ["Sci-Fi", "Action", "Drama", "Comedy", "Horror", "Animation"] },
    { id: f_movie_films,     label: "Best films you watched this year", type: "CHECKBOX", isRequired: true, page: 1, options: ["Dune: Part Two", "Inside Out 2", "Deadpool & Wolverine", "Alien: Romulus", "Twisters", "Furiosa"] },
    { id: f_movie_rating,    label: "Rate this year's movie slate overall", type: "RATING",   isRequired: true,  page: 1 },
    { id: f_movie_theater,   label: "Do you prefer theaters over streaming?", type: "YES_NO",  isRequired: true, page: 1 },
    { id: f_movie_frequency, label: "How often do you watch movies?",    type: "SELECT",   isRequired: true,  page: 1, options: ["Daily", "2–3 times a week", "Weekly", "Monthly", "Rarely"] },
    { id: f_movie_review,    label: "Share your mini movie review",       type: "TEXT",     isRequired: false, page: 1, placeholder: "What stood out to you?" },
    { id: f_movie_lastwatch, label: "Date of last movie you watched",     type: "DATE",     isRequired: false, page: 1 },
  ],
  submissionCount: 12,
  makeSubmission(fields) {
    const slateWeights = [1, 2, 4, 6, 5];
    const freqWeights  = [1, 4, 6, 4, 2];
    return fields.map((f) => {
      let value: FormSubmissionValue["value"] = null;
      if (f.id === f_movie_genre)     value = f.options![ri(0, f.options!.length - 1)]!;
      if (f.id === f_movie_films)     value = JSON.stringify(pickN(f.options!, ri(1, 4)));
      if (f.id === f_movie_rating)    value = pickWeighted([1, 2, 3, 4, 5], slateWeights);
      if (f.id === f_movie_theater)   value = Math.random() > 0.35;
      if (f.id === f_movie_frequency) value = pickWeighted(f.options!, freqWeights);
      if (f.id === f_movie_review)    value = movieReviews[ri(0, movieReviews.length - 1)] ?? null;
      if (f.id === f_movie_lastwatch) {
        const daysAgo = ri(1, 30);
        value = new Date(NOW - daysAgo * DAY_MS).toISOString().split("T")[0]!;
      }
      return { formFieldId: f.id, value };
    });
  },
};

/* ─────────────────────────────────────────────────────── form catalog ── */

const ALL_FORMS: FormDef[] = [
  animeFanSurvey,
  startupFeedback,
  gamingTournament,
  eventRsvp,
  moviePoll,
];

/* ─────────────────────────────────────────────────────────── cleanup ── */

async function clearDemoData() {
  const existingUsers = await db
    .select({ id: usersTable.id })
    .from(usersTable)
    .where(inArray(usersTable.email, DEMO_EMAILS));

  if (existingUsers.length === 0) return;

  const userIds = existingUsers.map((u) => u.id);

  const existingForms = await db
    .select({ id: formsTable.id })
    .from(formsTable)
    .where(inArray(formsTable.createdBy, userIds));

  if (existingForms.length > 0) {
    const formIds = existingForms.map((f) => f.id);
    await db.delete(formFieldTable).where(inArray(formFieldTable.formId, formIds));
  }

  // form_submission has onDelete: cascade from formsTable, so deleting forms removes submissions
  await db.delete(formsTable).where(inArray(formsTable.createdBy, userIds));
  await db.delete(usersTable).where(inArray(usersTable.email, DEMO_EMAILS));

  console.log(`  ✓ cleared ${existingForms.length} demo forms and ${existingUsers.length} demo users`);
}

/* ─────────────────────────────────────────────────────────── seeding ── */

async function seedUsers() {
  const adminSalt = makeSalt();
  const demoSalt  = makeSalt();

  const [admin, demo] = await db
    .insert(usersTable)
    .values([
      {
        fullName: "Admin User",
        email:    "admin@formflow.dev",
        salt:     adminSalt,
        password: hashPassword(adminSalt, "Admin@123"),
        role:     "ADMIN",
        emailVerified: true,
      },
      {
        fullName: "Demo User",
        email:    "demo@formflow.dev",
        salt:     demoSalt,
        password: hashPassword(demoSalt, "Demo@123"),
        role:     "USER",
        emailVerified: true,
      },
    ])
    .returning({ id: usersTable.id, email: usersTable.email });

  console.log(`  ✓ users: admin@formflow.dev (ADMIN), demo@formflow.dev (USER)`);
  return { adminId: admin!.id, demoId: demo!.id };
}

async function seedForms(ownerId: string) {
  for (const form of ALL_FORMS) {
    // ── insert form ────────────────────────────────────────────────────
    await db.insert(formsTable).values({
      id:          form.id,
      title:       form.title,
      description: form.description,
      slug:        form.slug,
      status:      "published",
      visibility:  "public",
      isArchived:  false,
      maxResponses: form.maxResponses ?? null,
      expiresAt:   form.expiresAt ?? null,
      createdBy:   ownerId,
    });

    // ── insert fields ─────────────────────────────────────────────────
    const fieldRows = form.fields.map((f, idx) => ({
      id:          f.id,
      formId:      form.id,
      label:       f.label,
      labelKey:    labelKey(f.label),
      description: f.description ?? null,
      placeholder: f.placeholder ?? null,
      type:        f.type,
      isRequired:  f.isRequired,
      options:     f.options ?? null,
      page:        f.page,
      index:       String(idx + 1),
      conditions:  f.conditionFieldId
        ? [{ fieldId: f.conditionFieldId, operator: f.conditionOperator!, value: f.conditionValue! }]
        : null,
    }));

    await db.insert(formFieldTable).values(fieldRows);

    // ── insert submissions ────────────────────────────────────────────
    const submissionRows = Array.from({ length: form.submissionCount }, () => ({
      formId:    form.id,
      values:    form.makeSubmission(form.fields),
      createdAt: randomTs(14),
    }));

    await db.insert(formSubmissionTable).values(submissionRows);

    console.log(
      `  ✓ "${form.title}" — ${form.fields.length} fields, ${form.submissionCount} submissions${form.slug ? ` (/f/${form.slug})` : ""}`,
    );
  }
}

/* ─────────────────────────────────────────────────────────── entrypoint */

async function main() {
  console.log("\n🌱 FlowForm seed script\n");

  console.log("⟳  Clearing existing demo data...");
  await clearDemoData();

  console.log("\n⟳  Seeding users...");
  const { demoId } = await seedUsers();

  console.log("\n⟳  Seeding forms, fields, and submissions...");
  await seedForms(demoId);

  console.log("\n✅ Seed complete!\n");
  console.log("  Credentials:");
  console.log("    admin@formflow.dev  /  Admin@123  (ADMIN)");
  console.log("    demo@formflow.dev   /  Demo@123   (USER)");
  console.log("\n  Forms live at /explore — slug access via /f/<slug>\n");

  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Seed failed:", err);
  process.exit(1);
});
