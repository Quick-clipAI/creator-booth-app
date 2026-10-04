# Creator Booth

**v1.2.4**

A football-only AI chat app for fans and creators: match and player analysis, research with sources, match-day scripts and club banter, backed by live web search and real match/coach data (API-Football), not just whatever the model remembers from training. Runs as a website and as an Android app (see the `creator-booth-app` project).

## Versioning

**Version numbers: only ever bump the LAST number.** 1.2.3 → 1.2.4 → 1.2.5. Do not
touch the middle or first number unless the owner explicitly asks for it (for
example, 1.2.9 → 1.2.10 is correct, 1.2.9 → 1.3.0 is not). One release = one
increment, no matter how many changes it contains. The Android app project
(`package.json` + the app README) uses the same number.

**This README must be updated on every change, in the same commit/patch as
the code.** Not just the version number — the relevant sections above too
(features, known gaps, deploy steps) if they changed. A README that
describes an old version is worse than no README, because it actively
misleads whoever reads it next.

On every update:
1. Bump `APP_VERSION` in `index.html` (single source of truth — it drives
   both the header tag and the Settings screen automatically).
2. Bump `"version"` in `package.json` to match.
3. Add a line to the changelog below.
4. Update whichever sections of this README are now stale.

### Setup: feedback table (required for Settings → Send feedback, v1.2.3)

Run this once in Supabase → SQL Editor. Until you do, the feedback form shows "Couldn't send it just now".

```sql
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete set null,
  rating smallint not null check (rating between 1 and 5),
  category text check (category in ('bug','idea','confusing','praise')),
  message text not null check (char_length(message) between 5 and 2000),
  contact text check (contact is null or char_length(contact) <= 200),
  app_version text,
  platform text,
  viewport text
);
alter table feedback enable row level security;
create policy "Anyone can send feedback" on feedback
  for insert to anon, authenticated
  with check (user_id is null or user_id = auth.uid());
-- Deliberately no SELECT policy: nobody can read feedback through the app.
-- You read it in Supabase → Table Editor → feedback.
```

### Setup: profiles table (required for onboarding survey + personalization)

v1.4.0 adds a personalization survey and Profile settings backed by a new Supabase table. Run this once in your Supabase project's SQL Editor:

```sql
create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  surname text default '',
  other_names text default '',
  nickname text default '',
  referral_source text default '',
  referral_other text default '',
  use_case text default '',
  favorite_club text default '',
  notes text default '',
  script_preferences text default '',
  onboarded boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "Users manage own profile" on profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

Until this table exists, profile/onboarding features fail silently (no onboarding prompt, greeting falls back to email prefix) rather than breaking sign-in — but run this before shipping v1.4.0 so personalization actually works.

### Setup: feedback column (required for persisted thumbs up/down)

v1.7.0 makes the thumbs up/down buttons actually persist instead of being local-only UI. Run this once in your Supabase project's SQL Editor:

```sql
alter table messages add column if not exists feedback text;
```

Until this column exists, tapping thumbs up/down still gives visual feedback but the save silently fails (caught and ignored, same fail-open pattern as the rest of this app) — so it's safe to deploy before running this, just won't actually persist until you do.

### A note on image storage (v1.7.0)

Attached images are now compressed client-side (max 1024px, JPEG ~70% quality) and saved as base64 directly in the `messages.media` jsonb column — not Supabase Storage. This is the simpler option and fine for personal/moderate use, but it counts against Supabase's free-tier **database** size limit (500MB), not the separate Storage limit (1GB), and base64 is ~33% larger than the raw bytes. If image use grows heavy, migrating to Supabase Storage (storing a URL instead of the bytes) would be the next step — flagging now so it's a deliberate choice later, not a surprise.

### Changelog

- **v1.2.4** — About the author filled in (About page → "About the author"): name, short bio, a round avatar made from the pPrince logo, and a link to the freeCodeCamp Responsive Web Design certificate. Personal email and phone number are deliberately NOT shown on the public page. Edit the `ABOUT_AUTHOR` object in `index.html` to change any of it; leave `bio` empty to hide the section again. Inside the app, links open in the phone's browser.
- **v1.2.3** — Everything since v1.2.2, in one release. (An earlier build of this work was labelled v1.3.0; the correct number is v1.2.3 because only the last number is bumped.)
  1. **Offline start.** Chat list and the latest chat show straight from the phone's saved copy (about 0.2s in testing); the 12 most recent chats are saved while online so they open offline. The welcome form never appears offline; it only shows after the server confirms a new user.
  2. **Sidebar account name.** Nickname, then first name, then surname; the email only when the profile is empty. The name sits in a box that ends in "…" when long, and the Google profile photo is used when available, with the initial as fallback.
  3. **Small and zoomed phones.** Home cards stay clear of the input box (checked at 360x640, 360x800, 553x1270); the send button fits narrow screens.
  4. **Theme.** Settings → Appearance cycles System / Light / Dark (System is the default). **Dark is now true black (#000)** so it matches the phone's status bar; the Android status bar colour follows the theme.
  5. **Typing reveal** no longer scrolls the page while text appears; a "Jump to latest" button shows if the text runs below the screen.
  6. **Thinking animation:** the star rolls once, then the ball comes out of its centre.
  7. **Reply length pill:** Short (about 60-150 words, default) or Deep (about 400-800 words).
  8. **No more blank chats.** "New chat" is just a blank screen until the first message is sent; the chat is saved then. Old empty "New chat" entries (older than 2 minutes, zero messages) are cleaned up once per sign-in. Guest chats too.
  9. **About Creator Booth page** (Settings → About): what it is, the problem, how it helps, how it differs from a general chatbot, and (website only) a Website-vs-App comparison. It contains only claims that are true of the code. The "About the author" block is controlled by `ABOUT_AUTHOR` in `index.html` (hidden while `bio` is empty).
  10. **Send feedback page** (Settings → Send feedback): star rating, optional category, message, optional reply email. Works signed in or as a guest. Needs the `feedback` table above. Terms and Privacy updated to say what is stored.
  11. **"Get the app" popup** on the website for Android browsers (after about 9s, never over sign-in, and hidden for 14 days once dismissed). Its button goes to `/download`, a redirect defined in `vercel.json`, so the GitHub address isn't printed on the page. Also available from Settings → Get the Android app. Not shown inside the app.
  12. Removed the dead Voice and Help & FAQ rows from Settings (the FAQ now lives on the About page); Terms and Privacy rows open those pages.
- **v1.2.2** — New logo everywhere; version label reset to v1.2.2 (entries below used a higher internal numbering and are kept for history).
  1. The asterisk-and-ball logo replaces the old three-bar mark on the home screen, sign-in and welcome screens, sidebar, reply footer, and the "Thinking…" loader (which now pulses the logo). Terms and Privacy pages carry it too.
  2. The site finally has a favicon (`favicon.svg`, `favicon.ico`), an iOS home-screen icon (`apple-touch-icon.png`), and a link-preview image (`icon-512.png`).
  3. Logo orange is `#FF6A1A` (CSS variable `--brand`); the interface accent colour is unchanged.
- **v2.2.0** — Desktop layout. Phones are pixel-identical to v2.1.0.
  1. From 900px wide: wider reading column (800px), larger text, bigger home screen and centered composer.
  2. From 1100px wide: the chat list is a permanent left sidebar (no hamburger, no dimming overlay).
  3. Short windows (under 750px tall) get a compact home screen so nothing overlaps.
- **v2.1.0** — Groundwork for the Android app; the website itself behaves the same.
  1. **Google + email sign-in can return to the app.** Inside the app, Google opens in the phone's real browser (Google blocks sign-in inside embedded WebViews) and comes back through a `com.creatorbooth.app://login-callback` link; email sign-in links use the same return link. On the website nothing changes. **Supabase → Authentication → URL Configuration → Redirect URLs must also contain `com.creatorbooth.app://**`.**
  2. **In-app updates.** The app checks GitHub for a newer web build, downloads it quietly, and offers a one-tap restart. Inactive on the website.
  3. Everything above is gated behind `NATIVE` in `index.html`; the build script in the app project injects the pieces it needs. The placeholder `'__GITHUB_REPO__'` is replaced at app-build time and is harmless on the website.
- **v2.0.0** — Two decisions actually built this time, not just discussed:
  1. **Football-only, for real.** The other 5 modes (Story, Secret Web Tools, Hidden AI/Prompting Guides, Conspiracy/History, AI News Roundup) are gone — `MODES` is now a single football entry, the mode-picker dropdown is removed entirely (the pill is now a static badge, nothing left to pick), and the header now carries a permanent "FOOTBALL AI" tag under the Creator Booth name. The football system prompt itself was rewritten to explicitly cover **two registers** instead of being a narrow video-scriptwriter prompt: an OFFICIAL register (research, analysis, scripts — accurate, respects verified data) and a BANTER register (jokes, hot takes, rivalry roasts — only when actually asked for, grounded in real well-known context, never a fabricated specific incident stated as fact). Added a 5th Home quick-start card, **Banter**, styled distinctly (dashed border) from the 4 "official" cards to make that duality visible rather than hidden behind a system-prompt detail. A caught-by-testing bug from this pass: the removed mode-switcher was calling a function immediately at page-load that read a `let`-declared variable before its declaration had run (a temporal dead zone crash) — would have broken the entire app on load; found by actually loading the page in a real browser, not by reading the diff.
  2. **Supabase done properly — a real local cache, not a replacement.** Signed-in users' chats/messages now mirror into IndexedDB (not `localStorage` — realistically hundreds of MB+ of quota instead of ~5-10MB, available identically on the website and inside the Android app) every time they're fetched from or written to Supabase. `refreshChatList()` and `openChat()` try Supabase first; if that fails (offline, or Supabase unreachable), they fall back to the local cache instead of showing nothing or throwing — verified in a real headless-Chrome test where the fake backend was made to genuinely throw when offline, confirming the fallback path (not just lucky mock behavior) returns the correct chat list and message content. Supabase remains the only source of truth; this is purely a read cache, so signing in on a second phone still works exactly as before. **Scoped per account on purpose:** the entire cache is wiped the moment a different user signs in on the same device (verified: after switching from one test account to another, the first account's cached chats are completely gone, never visible to the second) — directly addresses the "someone logs in on another person's phone" concern, by never trying to filter a shared cache and instead just not sharing it at all. Also wired into chat delete and account delete, so removed chats don't linger in the cache indefinitely. Found and fixed two real gaps while building this: `refreshChatList`/`openChat` had no error handling around their Supabase calls at all before this (a network failure there would have thrown uncaught), and `createChat` now fails with a clear toast instead of an uncaught exception when attempted while offline.
- **v1.9.0** — An audit pass plus three concrete fixes from the offline-experience discussion:
  - **Audit findings.** Ran a real dependency check (which functions are actually called anywhere) plus Chrome's CSS coverage tool across multiple app states. Confirmed dead code, removed: `addChips()` and its `.chips`/`.chip` CSS — leftover from the old numbered-chip feature that was removed from the UI a while back, but the function itself was never deleted; `summarizeFixtureList()` — an orphaned helper, never wired to anything; `api/google-tts.js` and `api/elevenlabs.js` — unused backend routes from before the chat-UI rebuild, already flagged as dead in this README but never actually deleted until now. **Not removed, flagged as a decision for you instead:** 5 of the 6 chat modes (Story, Secret Web Tools, Hidden AI/Prompting Guides, Conspiracy/History, AI News Roundup) have had zero feature investment for a long time — no quickstart card, no onboarding tie-in, no verified-data badge, nothing — while Football has gotten every enhancement. That's not a bug, but it is a product question worth deciding on purpose: keep maintaining all 6 as general-purpose modes, or lean fully into football and simplify/remove the rest. (The CSS coverage run also flagged ~178 "unused" selectors, but almost all of those are hover/active/modal/error states a quick synthetic script doesn't trigger — not a reliable dead-code signal, so nothing was removed on that basis alone.)
  - **Offline sends now detected honestly and retried automatically.** Sending while offline no longer shows a generic "couldn't save" warning — it shows "You're offline — this will send automatically once you're back online," and actually does exactly that the moment the connection returns (via the browser's `online` event), with no button to press. Applies to both the AI reply and the message-save step. Found and fixed a related gap while building this: the signed-in (Supabase) save path had no `try/catch` around its network calls, so a genuine network failure there could throw unhandled and hang silently with no warning and no queued retry at all — guest/local saves were already resilient to this since localStorage doesn't care about network.
  - **Suggested-question chips now explain themselves.** They previously appeared as unlabeled buttons with no context for why they were there. Each set now gets a short, naturally-varied lead-in generated by the model itself (e.g. "If you want, I can also:", "A few directions I could take this:") instead of the same static caption every time.
  - **On local/offline chat storage — deliberately not built this round, see chat for the full reasoning:** the "only cache accounts in Supabase, keep chats local" framing conflates two separate things — offline access and Supabase storage cost — and solving the actual ask (read chats with no signal, without breaking multi-device login) means a proper local *cache* of the cloud data (IndexedDB, not localStorage — much larger quota, available on both the website and the app), namespaced per signed-in user so a second person on the same device never sees the first person's chats, with Supabase staying the source of truth rather than being replaced. That's a real subsystem, not a quick patch — flagged for a deliberate go/no-go rather than built alongside a cleanup pass whose whole point was reducing scope.
- **v1.8.0** — Four real regressions from v1.7.x, all root-caused and fixed — see the chat for how each was actually verified (a headless-Chrome test with a mocked backend, inspecting the real network requests and DOM, not just reading the code):
  1. **The AI never actually had memory.** Every message was sent as a standalone request — no prior turns included, ever, since the very first version of the chat pipeline. `buildHistoryContents()` now reconstructs the earlier turns from the thread itself (works correctly for a fresh send, a regenerate, an edit, or a chat reloaded from history) and includes them in the request, with an explicit instruction telling the model to treat follow-ups like "what of France and Mbappé" as continuations of the topic rather than standalone questions. History is capped (~16 turns / ~14k characters) so a very long chat doesn't blow up the request.
  2. **"Everything goes blank until you scroll up."** Root cause: the scroll spacer added in v1.6.0 sat at the end of the thread, but every new message was being appended with plain `.appendChild()`, which — since the spacer was already the last child — pushed each new message in *after* it, behind a few hundred pixels of blank space. Fixed by routing every message insertion through one `appendToThread()` helper that always inserts before the spacer, so the spacer stays a trailing buffer instead of a wall in the middle of the conversation.
  3. **Copy/thumbs only showing on the last message.** Root cause: reloading a chat only ever wired action buttons onto the single last assistant message — every older reply in history rendered with no buttons at all, and this got worse once v1.7.0 made thumbs actually persist, since there was no working button to press. Every reply now gets its own action row on reload, each correctly paired with the user message that actually preceded it (not the chat's last one).
  4. **Long-press showed Chrome's own selection/search popup instead of an app menu.** Never actually built — v1.6.0's action-row redesign added buttons but no long-press handling. Built now: touch-and-hold a message for a custom menu (Select text / Copy, plus Regenerate + thumbs on the last reply, or Edit on your last message) instead of the browser's native text-selection toolbar. "Select text" opens a sheet where normal text selection still works, since it's disabled on the bubbles themselves to make room for the long-press gesture. Desktop mouse users are unaffected.
  - **Also fixed while diagnosing the above:** replies now render actual structure — paragraphs, bullet/numbered lists, and **bold** — instead of a wall of text with stray asterisks (the prompt was explicitly telling the model to avoid all formatting, a leftover from when only spoken-script mode existed); a failed or missing reply now shows a "Try again" button instead of a dead end; save failures (network hiccup mid-send) show a small warning instead of silently vanishing on reload; and the old single global "last message" pointer — which could end up aimed at the wrong row after a reload or a failed insert — was replaced with a per-message reference, so regenerate/edit/feedback always act on the exact message they were pressed on.
- **v1.7.1** — Backend groundwork for the Android app (see the new `app/` folder):
  - Every frontend call to `/api/gemini`, `/api/groq`, and `/api/football/...` now goes through an absolute `API_ORIGIN` (`https://creator-boot.vercel.app`) constant instead of a same-origin relative path. Behaves identically on the website (still same-origin, no functional change) but is what makes the app work at all — the app bundles this same file locally at a different origin (`https://localhost`), and a relative `/api/...` path there would have resolved against the app's own local origin and failed outright.
  - Added CORS headers (`Access-Control-Allow-Origin: *` + `OPTIONS` preflight handling) to `api/gemini.js`, `api/groq.js`, and `api/football/[...path].js`, since the app now calls them cross-origin. No change in behavior for same-origin website calls.
- **v1.7.0** — Decided against a native app for now (see chat discussion — Capacitor wrapper is real future work, not this pass) and built the three flagged ideas instead:
  1. **Images now persist in chat history.** Attached images are compressed client-side (max 1024px, JPEG ~70%) before both sending to the AI and saving — see the "note on image storage" section above for the storage tradeoff (DB jsonb column, not Supabase Storage). Reloading a chat now shows the actual photo again instead of nothing. Regenerating the last reply after a reload also now correctly re-sends the original image(s) — previously it silently dropped them even when they were the last live message in a session. Editing a message's text no longer wipes its attached images (was a real bug introduced by this change — replace-saves overwrite `content` and `media` together, so the fix now re-reads the existing images from the DOM before saving an edit).
  2. **Thumbs up/down now actually persist** to a new `feedback` column on `messages` (SQL above) via a `msgFeedbackRef` map from DOM element → storage row, set right after each message saves. Tapping an already-active thumb clears it rather than getting stuck on. Reloading a chat restores whichever thumb was previously pressed on the last message.
  3. **Favorite-club narrative lean for scripts.** When writing a video script (not a neutral factual answer) about a match involving the person's favorite club, the model may narrate with a light sympathetic lean — more emphasis on their good moments, a charitable read on an ambiguous call — the way a fan channel naturally would. Explicitly scoped to framing/word-choice only: every score, stat, and fact must stay accurate regardless of lean, and neutral factual questions ("who won") get a neutral answer with no lean at all.
- **v1.6.0** — A big batch from one review session:
  1. **Investigated the "stray n" glitch** reported at the bottom-left corner — found nothing in source (no stray text node, no NaN-producing calculation) that would explain it, and it showed up identically on an old v1.4.0 screenshot, before any of this session's layout changes. Best guess: Vercel's own "Toolbar" widget, which auto-injects on your deployment for any browser signed into your Vercel account — not part of this app's code at all. Test in an Incognito tab (signed out of Vercel) to confirm.
  2. **Responsive layout** — capped and centered the content column above ~720px viewport width (desktop/tablet browsers), so it no longer stretches edge-to-edge on a PC. Below that breakpoint (phones, including narrow ~360dp ones), nothing changed.
  3. **Header icon pill** — the top-right action icons (export/new chat/options/delete) now sit inside a small rounded pill background, matching the grouped-icon treatment you pointed out.
  4. **Sources redesigned** — collapsed by default into a small favicon-stack + "Sources · N" toggle; tapping it expands the full card list inline, instead of always dumping full cards into every reply.
  5. **Football research scope fix** — football mode's prompt now explicitly says not to limit "what happened" questions to one league and not to conclude "no football happened" just because e.g. the Premier League has no fixture that day — international windows (World Cup/AFCON qualifiers, Nations League, friendlies) and other competitions are accounted for.
  6. **Suggested follow-up questions** — substantive replies now end with 2-4 tappable follow-up prompts (parsed out of the model's own response via a `===SUGGESTIONS===` marker, never shown as raw text); tapping one sends it immediately, same as the ChatGPT pattern that prompted this.
  7. **Playful club banter** — when a favorite club is set in the profile (from the onboarding survey) and the person explicitly asks for a joke/banter, the model can lean into good-natured rival-club ribbing grounded in real, well-known struggles (trophy droughts, bad form) — never invented specific incidents, never unprompted.
  8. **Scroll anchoring** — sending a message now scrolls it to just below the top of the screen instead of jamming it at the very bottom edge, leaving room for the reply to fill in below; long replies still naturally follow to the bottom as they grow.
  9. **Custom icons** — all 6 mode icons and the 4 Home quick-start card icons are now custom line-SVGs matching the app's existing icon style, replacing the emoji placeholders.
  10. **Real chat titles** — a chat now shows "Generating title…" (styled distinctly) instead of the first 40 characters of your message, then gets a short AI-generated title (e.g. "Man City manager check") once the first reply actually lands — one lightweight extra Gemini call per new chat, only once.
  - **Also fixed while in this code:** suggestion-chip taps could theoretically fire a second generation while one was already running — added a proper `isGenerating` guard rather than leaving that unprotected.
- **v1.5.0** — Built the two lowest-risk pieces of the football-first redesign discussion (see README history / chat for the full reasoning on what was deferred and why):
  1. **Home quick-start cards** — 4 small cards (Match Analysis, Player Analysis, Football Research, Script Studio) under the greeting on an empty chat. They don't open new screens — each just switches to football mode and pre-fills the composer with a starter phrase, so the person finishes typing and sends as normal. Kept small and Claude-like on purpose, not dashboard tiles.
  2. **Verified / Research split** — football replies that actually found live API-Football data now show a small, muted-green "Verified football data" badge listing exactly which facts were confirmed (score, scorers, cards, match stats, current coach, etc.) — never a generic "verified" stamp, always the specific fields that were real for that reply. Source chips were upgraded into proper cards (favicon, title, domain, "→" link) under a "Web research · N sources" label. Deliberately did **not** add a fabricated "Used for: X" line per source — grounding metadata doesn't tell us which source contributed which fact, and guessing would undermine the whole point of a "verified" section.
  - **Explicitly not built this round** (flagged as bigger, separate work): full Match Analysis / Player Analysis screens with timelines, tactics, and formations — the current API-Football free tier only reliably covers *today's* fixtures, not historical match search or formation data, so those screens would mostly show "no data available." Numeric "AI Assessment" player rating bars (9.1 Vision, etc.) were also deliberately skipped — they'd contradict the app's own "never invent a stat" principle. A persistent bottom tab bar was skipped too — it's a layout-architecture change (composer/keyboard interaction, view structure), not a styling one.
- **v1.4.1** — Fixed the onboarding trigger: it only fired for accounts that already had a `profiles` row with `onboarded: false`, so every account that existed *before* v1.4.0 (which has no `profiles` row at all) was silently skipped and never asked. Now it fires whenever there's no profile row yet, not just when there's an unfinished one — every pre-existing account gets asked exactly once, next time they sign in.
- **v1.4.0** — Three things:
  1. **Onboarding survey + personalization.** Right after a genuinely new sign-in (Google or email — never for guests, and never twice), a full-screen survey asks for surname (required), other names, nickname, how you heard about us (chip select + "Other, specify"), what you plan to use Creator Booth for, favorite club, and any other notes — all editable later in Settings → Profile, all optional except surname, "Skip for now" always available. Stored in the new `profiles` table (SQL above), synced across devices for signed-in users; guests get the same form saved to local storage instead. The chat greeting now prefers nickname → other names → surname → email prefix, in that order, instead of always using the email prefix. Terms and Privacy rewritten to disclose this data collection plainly (Section 4/2 respectively) — personalization only, never sold, deletable anytime.
  2. **Centered composer on a new chat** — on an empty chat, the input box lifts off the bottom edge and centers itself with the greeting (fixed position, capped width, more shadow) instead of sitting pinned to the screen edge. Reverts to the normal full-width bottom bar the moment a message is sent.
  3. **Word-by-word reply reveal** — freshly generated replies now type out word by word instead of appearing all at once, with a blinking cursor while typing; sources and action buttons fade in once typing finishes. **This is a client-side typewriter effect, not real token streaming** — the full response still has to finish generating before typing starts, so it doesn't reduce time-to-first-word. True streaming (Gemini's `:streamGenerateContent`) is possible but is a real backend change that complicates the Gemini→Groq automatic fallback and the timing of grounding source links — worth doing later if the typewriter effect isn't enough on its own.
- **v1.3.0** — Four things:
  1. **Loading indicator redesign** — the blinking orange dot is gone;
     the "thinking" state now shows three bars of the brand mark pulsing
     tall/short on a stagger, matching the logo instead of a generic dot.
  2. **Edit last message** — the single most-recent user message now has
     an edit (pencil) icon. Tapping it swaps the bubble for a textarea with
     a notice that saving will regenerate the response below it. Saving
     updates the message in place (storage + DOM) and regenerates the
     following assistant reply against the edited text; if that
     regeneration fails, the previous response is restored with a brief
     notice, same fallback behavior as plain regenerate.
  3. **Football club/coach verification** — football mode now runs a
     small deterministic pipeline before generating: a tool-free Gemini
     call extracts up to 3 club names mentioned in the request, each is
     looked up against API-Football's `teams` + `coachs` endpoints for
     its actual current manager, and the result is injected as a
     `=== VERIFIED CLUB/COACH DATA ===` block the model is told to treat
     as ground truth over its own memory — this is what actually catches
     cases like "Maresca manages Man City" (it doesn't; Guardiola does).
     **Why not a real tool-calling loop:** combining Gemini's built-in
     `google_search` grounding with custom function declarations in one
     request is a Gemini 3-only preview feature — this app runs on
     `gemini-2.5-flash`, so the model can't be handed a "look up the
     coach" tool to call itself. This is a fixed extract → verify →
     inject pipeline instead, not the model deciding when to check.
     **Known limitation:** only catches club/coach facts, only for up to
     3 clubs per request, and only when API-Football's team-name search
     resolves a match — anything else still relies on Gemini's own
     search grounding (and the v1.2.2 date/time nudge) as before.
  4. Football mode's system prompt updated to reference the new verified
     block alongside the existing match-data one.
- **v1.2.2** — Every request now gets the visitor's current date/time
  injected into the system prompt, plus an explicit instruction to verify
  role/roster-type facts (managers, staff, club affiliations) via search
  rather than trusting memorized training data. **Known limitation:**
  Gemini's `google_search` tool has no API setting to force a search on
  every request (that existed for older Gemini 1.5 models via
  `dynamicRetrievalConfig`, removed for the tool used here) — this is a
  prompt-level nudge that improves the odds, not a guarantee. If stale
  facts keep slipping through, the real fix is a deterministic pre-search
  step (like `gatherFootballContext` already does for fixtures) feeding
  verified results in as required context — bigger lift, needs its own
  search API key, not yet built.
- **v1.2.1** — Regenerate now snapshots the previous response before
  clearing the message; if the regeneration attempt fails (both Gemini
  and Groq down), the old response is restored with a brief "couldn't
  regenerate" notice instead of being permanently lost behind an error
  box. Closes the tradeoff noted in v1.2.0.
- **v1.2.0** — Redesigned message actions to match a "reference layout":
  every assistant reply gets copy + thumbs up/down; only the current last
  reply also gets regenerate, plus a brand-mark/disclaimer footer row.
  Regenerate now actually replaces the message in place (same DOM element,
  same DB row updated via `saveMessage(..., {replace:true})`) instead of
  appending a second reply below the old one. Thumbs up/down are local-only
  UI feedback for now — no backend collects them yet. Per-message Share was
  removed (the header-level "Export chat" feature covers that need).
- **v1.1.1** — Added a GitHub Actions keep-alive workflow
  (`.github/workflows/supabase-keepalive.yml`) that pings Supabase every
  3 days so the free-tier project doesn't auto-pause after 7 days of
  inactivity. No app code changed.
- **v1.1.0** — Export chat as a "Speaker:- text" transcript, either copied
  to clipboard or downloaded as a PDF (jsPDF, lazy-loaded). Available from
  a header icon in both normal and incognito chats.
- **v1.0.0** — Merged the prototype chat UI into the production repo.
  6 content modes, Gemini + Google Search grounding, Groq automatic
  fallback (text + vision), best-effort football fixture context,
  Google/email auth via Supabase, incognito chats, image attachments
  (up to 4/message), message actions (copy/regenerate/share), Terms &
  Privacy pages, visible version tag. Voiceover, project/workspace
  management, and the old football tool-calling loop were not carried
  over — see "What this version doesn't do yet" below.

This is a rebuild of an earlier project (previously "Match Day Script Booth").
The backend proxy pattern carried over; the frontend was replaced with a new
chat-style UI, and the feature set was intentionally slimmed down in the
process — see **What this version doesn't do yet** below before assuming
parity with the old app.

## What it does

- **6 content modes** (Football, Story, Secret Web Tools, Hidden AI/Prompting
  Guides, Conspiracy/History, AI News Roundup) — pick one from the pill above
  the composer. Each mode is just a different system prompt; adding a 7th
  mode is a few lines in `MODES` in `index.html`, no architecture changes.
- **Gemini with live Google Search grounding** on every request — responses
  come with real source links, not just the model's training data.
- **Automatic Groq fallback** if Gemini's quota runs out mid-conversation, so
  the chat doesn't just die. Groq has no web-search tool, so a
  Groq-sourced answer is flagged in the UI (no grounding, and it's from the
  model's training data — treat it with more caution).
- **Best-effort live football context**: for Football mode, the app checks
  today's fixtures via API-Football for a team name match, and if it finds
  one, feeds Gemini real score/scorer/card/stat data as ground truth it can't
  contradict. This is a simple one-shot lookup, not a tool-calling loop (see
  below).
- **Image attachments**: the **+** button lets you attach up to 4 photos per
  message, sent to Gemini as native multimodal input. Attachments reset after
  each send — you can attach fresh images on your next message in the same
  chat, it's not a once-per-chat limit. If Gemini's down and an image is
  attached, the Groq fallback switches to a vision-capable model
  (`meta-llama/llama-4-scout-17b-16e-instruct`) instead of the usual
  text-only one.
- **Auth**: Google OAuth or email magic link via Supabase, with a full-screen
  sign-in take-over and a dedicated "check your email" confirmation screen.
  Guests can use the app fully — chats just save to `localStorage` instead of
  the account.
- **Incognito chats**: a dedicated ghost-mode landing screen, never
  persisted, with its own header controls (new chat / delete, both
  confirmation-gated so you don't lose a conversation by accident).
- **Per-chat management**: rename/delete from a header menu once a normal
  chat has messages.
- **Message actions**: copy + thumbs up/down under every assistant reply;
  the current last reply also gets regenerate (replaces that message in
  place — doesn't stack a second reply below it) plus a brand/disclaimer
  footer.
- **Export chat**: header icon (available in incognito too, not just normal
  chats) exports the full transcript as `Speaker:- text` turns, either
  copied to clipboard or downloaded as a PDF. PDF generation uses jsPDF,
  lazy-loaded from a CDN only when Download is actually clicked.
- **Terms & Privacy pages** (`/terms.html`, `/privacy.html`) — short,
  accurate placeholders, not full legal documents.

## What this version doesn't do yet

Carried over from the old app's README/code review, for anyone expecting
parity — these were cut or simplified during the rebuild, not forgotten:

| Feature | Status |
|---|---|
| Voiceover / TTS (ElevenLabs, Google Cloud TTS) | **Removed.** Deferred intentionally; no voice UI in this version at all. |
| Projects / saved workspaces (`createProject`, `saveWorkspace`, etc.) | **Not carried over.** Current app only has chats — no separate "project" concept. |
| Football tool-calling loop (`toolGetMatchFacts`, `toolGetHeadToHead`, live function-calling) | **Simplified.** Replaced with a single one-shot fixture lookup for *today's* matches only. No head-to-head, no multi-turn tool use. |
| Chat images persisted to history | **Not yet.** An attached image is used for that one request only; reloading a chat shows a text placeholder, not the image. |
| Custom email sender (vs. default "Supabase Auth") | **Not set up.** Requires a domain + SMTP provider (Resend, etc.) — see in-app disclaimer instead. |

If you want any of these back, the architecture (see below) is set up to
make that additive rather than a rewrite.

## Architecture

Everything lives in one `index.html` (~55KB) plus a handful of serverless
proxies under `api/`. It's intentionally still a single file at this size —
see the "splitting it up" note below for when that stops being true.

- **`callAI()`** centralizes all model calls: tries Gemini first (with
  whatever `tools`/`system_instruction` were requested, including search
  grounding), falls back to Groq on any failure. `geminiToolsToOpenAI()` /
  `geminiContentsToOpenAIMessages()` / `openAIResponseToGeminiShape()` handle
  the format translation between the two APIs, including image content.
- **`MODES`** is a flat array of `{id, icon, label, system}` — the entire
  "personality" surface of the app. No per-mode branching anywhere else in
  the pipeline.
- **`gatherFootballContext()`** does the one-shot API-Football lookup;
  `runPipeline()` is the single request/response flow every mode goes
  through.
- Supabase handles auth + chat/message storage for signed-in users;
  signed-out users get the same UI backed by `localStorage`.

### If this grows past a few more modes

At some point — a "Movie Creator" mode, a "Gaming" mode, real tool-calling
coming back — this stops being comfortable as one file. The natural split,
whenever that's warranted:

```
js/
  chat.js       runPipeline, callAI, MODES
  football.js   gatherFootballContext + any tool-calling that comes back
  auth.js       Supabase auth screens
  ui.js         drawer, settings, modals, header state machine
  storage.js    chats/messages persistence (Supabase + localStorage)
```

Not needed yet at this size — noted here so it's a deliberate choice later,
not a surprise.

## Deploy steps

1. **Push this folder to a GitHub repo**, or replace the contents of an
   existing one.
2. **Go to [vercel.com](https://vercel.com) → New Project → Import** that
   repo. No build settings needed — Vercel auto-detects `api/` as
   serverless functions and serves `index.html` as-is.
3. **Add your keys**: Project → Settings → Environment Variables →
   - `GEMINI_API_KEY` — from aistudio.google.com/apikey
   - `API_SPORTS_KEY` — free key from dashboard.api-football.com (Account → My Access)
   - `GROQ_API_KEY` — (optional) free key from console.groq.com/keys, no card
     required. Automatic backup when Gemini's quota runs out. The chat still
     works without it, it just has no fallback.

   Then **redeploy** (Deployments tab → ⋯ → Redeploy) — Vercel doesn't
   hot-reload env vars into an existing deployment.
4. **Configure Supabase auth redirect URLs** (separate from Vercel): in your
   Supabase project → Authentication → URL Configuration, set **Site URL**
   to your deployed domain (e.g. `https://creator-boot.vercel.app`) and add
   it to **Redirect URLs** as `https://your-domain/**`. If this is still set
   to `localhost`, both Google and email sign-in will redirect to a dead
   `localhost` URL after auth — this bit us once already.
5. Open the deployed URL and click through: sign-in (both methods), each
   mode, a football request, an image attach, and incognito — before
   trusting it's fully working. None of this has had a real end-to-end test
   pass yet as of v1.0.0.

## Keep Supabase from auto-pausing

Supabase pauses free-tier projects after **7 days with no database
activity** — the project goes offline (`DNS_PROBE_FINISHED_NXDOMAIN` when
you hit its URL directly) until manually restored from the dashboard. This
happened once already, after a 2-month pause between working sessions.
Restoring is free and keeps all data, but it's an avoidable interruption —
the project resolves this the same day it happens, but only if someone
notices and restores it.

`.github/workflows/supabase-keepalive.yml` runs a real `SELECT` against the
`chats` table every 3 days (safe margin under the 7-day limit), so the
project never goes quiet long enough to trigger a pause. It needs no setup
— it's already wired to this project's URL/anon key (same ones hardcoded in
`index.html`; the anon key is public by design, so there's no security
reason to hide it as a GitHub secret here too). Confirm it's running: repo
→ **Actions** tab → "Supabase Keep-Alive" should show green runs every 3
days. You can also trigger it manually from there (**Run workflow** button)
to test it immediately.

If the project ever does get paused again anyway (workflow got disabled, a
run failed silently, etc.) — restoring from the dashboard is safe up to
**90 days** paused; past that, the "Restore" button is disabled entirely and
you'd need to download the backup and create a fresh project instead. Don't
let it sit paused for months on the assumption it's fine.

## Local testing (optional)

```bash
npm i -g vercel
vercel dev
```

Runs the same `api/` functions locally on `http://localhost:3000`. Put your
keys in a local `.env` file — `vercel dev` loads it automatically. Don't
commit `.env`. Note: if you test locally, your Supabase redirect URL config
needs `http://localhost:3000` in it *too* (in addition to, not instead of,
your production domain) or auth will break in one environment or the other.

## Files

```
index.html                    the app — chat UI, all client-side logic
terms.html                    Terms of Service (short placeholder)
privacy.html                  Privacy Policy (short placeholder)
api/gemini.js                 proxies Gemini generateContent (grounding + vision + system_instruction passthrough)
api/groq.js                   proxies Groq chat completions (text + vision fallback)
api/football/[...path].js     proxies any API-Football endpoint, e.g.
                               /api/football/fixtures?date=2026-07-27
api/google-tts.js             unused by the current frontend — leftover from the old voiceover pipeline
api/elevenlabs.js             unused by the current frontend — leftover from the old voiceover pipeline
vercel.json                   function config
package.json                  name/version/description only — no build step
```

`api/google-tts.js` and `api/elevenlabs.js` are dead code from the pre-rebuild
version — safe to delete if you're not planning to bring voiceover back, kept
for now since removing voiceover was a UI decision, not evidence the backend
routes are broken.
