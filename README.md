# Creator Booth — Android app (v1.4.2)

A native shell around the same web app as creator-boot.vercel.app. The web files are bundled
inside the app, so it opens instantly and starts offline. Chats, AI and sign-in still go to the
live backend (Supabase + the Vercel API), exactly like the website.

**Updates:** every push to `main` builds the app and publishes `creator-booth.apk`, `bundle.zip` (the web files) and
`version.json` to the release "latest". Installed apps read `version.json`. When it names a newer version, the app opens an
**Update available** sheet: **Update now** downloads the web files and restarts; if that fails (or the release needs a new
app file) the sheet shows **Download update**, which opens the APK. Settings -> App updates shows the last check and any error.
Only native changes (a new plugin, permission or icon) need the APK: raise `minApkVersion` in `package.json` for such a release.

**Important, once:** the update notice itself arrives inside the app, so a phone whose old updater was not working cannot receive it
by itself. Install the APK from the v1.3.4 build ONCE (Releases -> Creator Booth (latest) -> creator-booth.apk, or `/download` on the
website). It installs over the existing app and keeps your login and chats. From then on the notice works.

## v1.6.6 - update sheet goes straight to the file download

The quick update failed on the phone every time, so the update sheet now shows one button, Download update, which opens the APK. `OTA_ENABLED` in `www/index.html` turns the quick update back on. Install this APK once; the phone cannot receive it over the air.

## v1.6.5 - web update: competitions, logos, colours, analysis answers

Competition cards and screens for the Champions League and the leagues, own league logos (bundled in `www/logos`), per-league brand colours, Champions League match data, and chat answers built from form, table and head-to-head instead of reputation. Delivered over the air; no new APK.

## v1.6.4 - web update: Lineup tab on one shared pitch

The Lineup tab shows both teams on one pitch (home on top, away at the bottom) with the two coaches opposite each other and the substitutes and bench in two columns. Delivered over the air; no new APK needed.

## v1.6.3 - web update (no change inside the app)

Server-side: squads from API-Football. Version raised so both repos stay in step.

## v1.6.2 - web update (no change inside the app)

Admin: in-place updates, tab memory, easier sign-in. Version raised so both repos stay in step.

## v1.6.1 - web update (no change inside the app)

Admin: duplicate-club "Needs checking" list. Version raised so both repos stay in step.

## v1.6.0 - match screen shows "Entered by hand"

Small addition to the match facts (hand-entered details are labelled). Admin gained the by-hand match details import. Version raised so both repos stay in step.

## v1.5.9 - web update (no change inside the app)

Server-side fix for the transfers job. Version raised so both repos stay in step.

## v1.5.8 - web update (no change inside the app)

Admin: Change date on the Gaps list. Version raised so both repos stay in step.

## v1.5.7 - web update (no change inside the app)

Server-side: daily API-Football transfers job (spare requests only). Version raised so both repos stay in step.

## v1.5.6 - web update (no change inside the app)

Server-side fixes for fixture dates and API requests on the website; version raised so both repos stay in step.

## v1.5.5 - web update (no change inside the app)

Admin/data change on the website; version raised so both repos stay in step.

## v1.5.4 - web update (no change inside the app)

Admin-only change on the website; version raised so both repos stay in step.

## v1.5.3 - web update (no change inside the app)

The website gained an admin tab for Transfermarkt player profiles and "may have left" flags. The app's web files are the same as the website's; nothing changes on screen yet. Version raised so both repos stay in step.

## v1.5.2 - web update (daily data sync now 02:00 Nigerian time)

Server-side timing change only; nothing visible in the app.

## v1.5.1 - download fixes (web update)

The update files bucket in Supabase was private, so the quick update and the download link always used GitHub. It is public now. The website's "Get the app" box also works when Chrome is in "Desktop site" mode.

## v1.5.0 - match screen (web update, no new APK)

Tap the fixture card under a chat answer to open the match screen: Facts, Lineup, Table, Stats and Play-offs. The table highlights both clubs and colours qualification and relegation places. Tabs with nothing to show say "No data available". Line-ups and statistics are collected once after full time (1 API credit per match) and saved. Arrives over the air like every web update; the installed APK keeps working and does not need replacing. The Android back button closes the screen.

## v1.4.7 - web update (results checked after each match), no new APK

## v1.4.6 - web update (player import fix), no new APK

## v1.4.5 - fixture card (web update, no new APK)

Delivered over the air. Nothing to install.

## v1.4.4 - push notifications (NEW APK REQUIRED)

- Adds `@capacitor/push-notifications`, the notification permission, and a build step that writes `android/app/google-services.json` from the GitHub secret **`GOOGLE_SERVICES_JSON`**. The build stops with a clear error if the secret is missing or is for a different package than `com.creatorbooth.app`.
- Install the APK from Releases (Creator Booth (latest) -> creator-booth.apk, or `/download`) ONCE; it installs over the old app and keeps login and chats. Allow notifications when asked.
- `minApkVersion` stays 1.3.0 so older app files keep receiving web updates (they just have no push).

## v1.4.3 - Script Studio plan/Start and background script jobs

Web update delivered over the air; no new APK needed. Real push notifications (app closed) arrive in a later release and will need a new APK.

## v1.4.2 - chats ordered by last use, orange loading logo

- The chat list is sorted by when a chat was last used (message sent, edited or regenerated), so the app opens the chat you used last.
- The loading logo on launch is orange instead of white.
- Mode chips (Script, Match analysis, …) replace editable starter text; the chat now receives coach, squad and form facts from the data bank.
- Web-only changes: this release is delivered to installed apps as a small over-the-air update (no new APK needed). Run `4-chats-last-used.sql` in Supabase once.

## v1.3.8 — updates from Supabase Storage (needs a one-time setup)

Why: on some phones the update download from GitHub fails or crawls (version check worked, file download did not). Now the build also uploads the update files to a public Supabase bucket, which the app already reaches. The app uses whichever host has the newest version and falls back to the other.

One-time setup (about 5 minutes):
1. Supabase -> Storage -> New bucket -> name exactly `app-updates` -> turn **Public bucket** ON -> Create.
2. GitHub -> this app repo -> Settings -> Secrets and variables -> Actions -> New repository secret. Add `SUPABASE_URL` = `https://krmjvfemsufduqdofuqy.supabase.co` and `SUPABASE_SERVICE_KEY` = the secret/service key (the same one used in Vercel).
3. Upload this folder's files to the app repo and wait for the green build. In the build log, the step "Upload update files to Supabase Storage" should print `upload ... -> HTTP 200` three times. If it prints a warning, the secrets or bucket are missing; the build still succeeds and updates fall back to GitHub.
4. Install the new APK once (older app versions only know the GitHub path). After that, updates download from Supabase.

No native change: `minApkVersion` stays `1.3.0`.

## v1.3.6 — web only

Gemini 2.5 is the main AI; Groq live research is gone (retired by Groq); the chat now reads our data bank. The admin page (`admin.html`) is website-only and is not copied into the app (`prepare-www` bundles `index.html` only). No native change: `minApkVersion` stays `1.3.0`. Details are in the website README.

## v1.3.5 — web only

The "no live web search" note shows why research failed. No native change, so the v1.3.4 app file is fine; the update notice delivers this.

## v1.3.4 — update notice, honest research (web + this repo)

- New update sheet and **Settings -> App updates** (see "Updates" above). The check compares the app's own version number
  (`APP_VERSION`) with `version.json`, so it no longer depends on GitHub's run counter. `version.json` now carries `web` and `minApk`.
- The build warns (yellow annotation) if the app-file version was not stamped into `build.gradle`.
- Web side: debated topics always get the multi-search research model; a no-search answer that "corrects" the person is not shown.
  Details are in the website README.
- No native change in this release: `minApkVersion` stays `1.3.0`.

## What changed in v1.3

- **One native change:** the status bar plugin (`@capacitor/status-bar`). Installed apps need ONE new APK for the
  status bar to match the app colour; everything else in v1.3 arrives as a normal web update.
- Appearance setting (System / Light / Dark), short/deep reply toggle, offline-first chat loading,
  profile name + Google photo in the sidebar, no auto-scroll while a reply types out, new thinking animation.

## v1.2.5 — header under the status bar (fix)

The StatusBar plugin draws the app under the phone's status bar by default, which hid the top of the header.
Fixed two ways: the web code now turns that off at startup (arrives as a normal in-app update), and
`capacitor.config.json` sets it off natively (needs the new APK, once). Android 15+ phones are handled by
`adjustMarginsForEdgeToEdge: "auto"`.

## v1.2.6 — web only

Search tags and website-only visitor counts were added to `index.html`. The visitor-count script never runs in the
app (its address is https://localhost). No new APK needed.

## v1.3.3 — thinking leak fixed, richer research, Debate mode (web only)

- The model's own working-out ("The user's request appears to be...") no longer shows in answers. Extra text
  parts that look like planning are dropped, thought parts are ignored, and parts are never glued together.
- Live research now covers facts AND what pundits, players, fans and media are saying (who said what, where),
  the main camps, rumours/theories and what is unverified. It knows the earlier question for context and keeps
  look-alike events apart (e.g. a farewell match versus a final).
- Deep reply setting and Debate mode use the multi-search research model (groq/compound), falling back to
  groq/compound-mini. Short uses the fast one.
- New **Debate** mode (tap the mode pill): theories, hidden stories, who is saying what, and content angles.
  Claims are labelled confirmed / reported / speculation.

## v1.3.2 — honest reason when Gemini fails (web only)

When the search request is refused and the plain request ALSO fails, the orange note now shows the plain request's
reason (for example "Gemini busy" or "Gemini request limit reached") instead of the search refusal.

## v1.3.1 — loading screen and sturdier search (web + Vercel)

- A black loading screen with the animated logo now covers the app until the last chat is ready, so the empty
  "New chat" screen no longer flashes first. It disappears by itself after at most 5 seconds.
- If Gemini cannot answer at all (limit reached), the app now does the live web research FIRST and then lets the
  backup AI write the answer with it, instead of answering with no search.
- The Gemini proxy also moves to the next model in `GEMINI_MODEL` when a model's own free quota is used up.

## v1.3.0 — live web research (web + Vercel)

- If Gemini's own search is refused (common on free keys), the app asks Groq's search model to research the
  question, then writes the answer with that research and its sources. Remembered for 3 hours. Short chit-chat
  skips it. If research fails, the answer carries an honest "No live web search this time" note.
- Football proxy fixed (it was losing the endpoint name and API-Football answered "NOT AUTORIZED"); only the
  endpoints the app uses are allowed.
- Gemini proxy accepts a list of models (`GEMINI_MODEL=a,b,c`) and moves to the next one if a model is gone or busy.
- Web update only: no new APK needed.

## v1.2.9 — honest backup AI (web only)

When the backup AI answers (no web search), it is now told it cannot confirm recent events, so it no longer says
things like "that final never happened". It says it cannot verify and suggests trying again.

## v1.2.8 — Gemini model change (web + Vercel)

`gemini-2.5-flash` is being shut down by Google on 16 Oct 2026. The website's `/api/gemini` now uses `gemini-3.5-flash`
(set `GEMINI_MODEL` in Vercel to change it without code). The "Backup AI used" note now says why Gemini failed.
Needs a Vercel deploy of the website; the app uses the same endpoint, so no new APK.

## v1.2.7 — modes and fixes (web only)

- Real **Analysis / Banter** modes with a visible switcher on the composer. New chats always start in Analysis;
  each chat remembers its own mode on that device.
- Banter takes the profile's favourite club's side, and searches before joking.
- Club-name lookup and chat titles now use Groq first, so each message spends one Gemini request instead of two or three.
- AI requests time out instead of hanging; errors are plainer and stay on screen longer.
- No new APK needed.

## One-time setup

1. **Repo.** Create a new **public** GitHub repo (e.g. `creator-booth-app`) and upload the
   contents of this zip to its root (including the hidden `.github` folder). It must be public:
   download links for releases in private repos need a login.
2. **Keystore** (needs Java's `keytool`; install Temurin JDK 21 from adoptium.net):
   ```
   keytool -genkeypair -v -keystore release.keystore -alias creatorbooth -keyalg RSA -keysize 2048 -validity 10000
   ```
   Back up `release.keystore` and both passwords somewhere permanent. If you lose them you can
   never ship an update that installs over the existing app. Never commit the file.
3. **GitHub secrets** (repo → Settings → Secrets and variables → Actions):
   | Name | Value |
   |---|---|
   | `ANDROID_KEYSTORE_BASE64` | Linux/Mac: `base64 -w0 release.keystore` · Windows PowerShell: `[Convert]::ToBase64String([IO.File]::ReadAllBytes("release.keystore"))` |
   | `ANDROID_KEYSTORE_PASSWORD` | keystore password |
   | `ANDROID_KEY_ALIAS` | `creatorbooth` |
   | `ANDROID_KEY_PASSWORD` | key password |
4. **Supabase → Authentication → URL Configuration → Redirect URLs.** Keep your existing entries and add:
   ```
   https://localhost/**
   com.creatorbooth.app://**
   ```
5. **Build.** Actions tab → *Build Android APK* → *Run workflow*. First run takes several minutes.
   The result is a release named `latest` with three files:
   - `creator-booth.apk` — the install file
   - `bundle.zip` + `version.json` — what installed apps download to update themselves

   Your permanent download link (put it on the website):
   ```
   https://github.com/<username>/<repo>/releases/download/latest/creator-booth.apk
   ```

## Shipping an update later

Copy the new website `index.html` over `www/index.html` (leave the other files), commit and push to
`main`. The workflow rebuilds automatically. Installed apps pick up the new web files the next time
they are opened; new downloads of the APK get them too. You don't change anything else.

If you change anything native (`package.json` plugins, `assets/` icons, `capacitor.config.json`,
`scripts/patch-android.mjs`), also tell users to install the new APK.

## Version numbers

Count like an odometer. Each release raises the **last** number by one. When the last number would pass 9, it goes back to 0 and the **middle** number goes up by one. When the middle number would pass 9, it goes back to 0 and the **first** number goes up by one.

1.3.3 → 1.3.4 → 1.3.5 → 1.3.1 … 1.9.9 → **2.0.0**

Change it in `package.json` and in `APP_VERSION` in `index.html`. The Android version name is read from `package.json`; the build number (version code) is added automatically on every build.

## What's in here

- `www/` — copy of the website (the build script patches it inside the build only)
- `assets/` — logo files; icons and splash screens are generated from them
- `scripts/prepare-www.mjs` — bundles Supabase + native plugins locally, stamps the build number
- `scripts/patch-android.mjs` — registers the `com.creatorbooth.app://` sign-in return link
- `.github/workflows/build-android.yml` — builds, signs and publishes everything

## Not on the Play Store

Android shows an "unverified developer" warning for any app installed outside the Play Store.
Suggested wording for the download page: *"This app isn't on the Play Store yet, so Android may
warn that it's from an unverified developer. That's expected. Tap Install anyway."*

## Known limits

- Built and tested here: the web logic, the build scripts and every build step up to Gradle. Not
  tested here (no Android SDK/device): the Gradle build itself, Google/email return into the app,
  and the real download of an update. Test those on a phone after the first build.
- Update checks use GitHub's release download URL; updates need internet, the app works without it.
- The update plugin's usage stats are switched off (`statsUrl` is empty in `capacitor.config.json`).

## 1.6.7
Player card (tap a name on a competition's stats tab) with season totals, match list and the Creator Booth rating, plus a Rating list. Install the APK once: quick update is off.

## 1.6.8
Sends the login token and a per-message id with every AI call; a guest who used the 3 free messages sees the sign-in screen. Install this APK before AI_GUARD is switched to enforce on the server.

## 1.6.9
Fixes the app not responding (a syntax error in the chat instructions since 1.6.5). Install this APK; skip 1.6.8.

## 1.6.10
Club crests next to club names (table, fixtures, club stats); an "Incomplete" note on the player lists showing how many played matches they cover.

## 1.6.11
Top scorers now show full-season totals from football-data.org (games and penalties under each name).

## 1.7.2
Top scorers now land on the right club (Barcelona fix), the "Incomplete" banner is removed, and a scorer's card shows the football-data.org season total. Web content only; no new APK is needed beyond the usual rebuild.

## 1.7.3
Quick (web-files-only) update switched back on for testing. Install this APK once; the next update tests the quick path.

## 1.7.4
New player card (photo, rating ring, form, colours), a table head-to-head note, and a fix that queues missed matches for line-ups. Web files only.

## 1.7.5
Player cards show age, nationality and birth date from the stored squads. Web files only.

## 1.7.6
Admin tool to fill missing birth dates and nationality from football-data.org. Web files only.

## 1.7.7
Overwrite / preview / fill modes for the football-data.org player-details tool. Web files only.

## 1.7.8
Fill gaps is the default for the football-data.org player tool; Korea spelling fix. Web files only.

## 1.7.9
Player-details preview lists up to 80 conflicts per league. Web files only.

## 1.7.10
The conflict preview is saved to Supabase. Web files only.

## Data note 2026-11-09
Player data clean-up (conflicts resolved, duplicate clubs merged, gaps filled). No app change.

## 1.7.11
The player tool saves the players it could not match. Web files only.

## 1.7.12 — line-up screen redone (FotMob style), club crests on the match screen
- Line-up: no green pitch any more (dark neutral pitch). Each player is a round photo from API-Football (`media.api-sports.io/football/players/<id>.png`); with no id, or if the photo fails to load, a blank portrait stays.
- A rating shows only for players who played (rating above 0 and minutes not 0). Unused substitutes show none.
- Substitutions: red arrow + minute = subbed off, green arrow + minute = subbed on (minutes from the match events, e.g. 90+1). A legend under the line-up explains the icons.
- Bench is one grid like FotMob: players who came on first, then the unused ones, each with shirt number and position.
- Club crests: `lib/crests.js` finds a club's API-Football id by exact name, then `bank_aliases`, then its distinctive words ("Leipzig" finds "RB Leipzig"). Used by the competition screen and the match screen (head and line-up bars); a letter badge stays when no id is known.
- Clubs with no crest yet are mostly European-cup clubs from outside our five leagues (about 80). Their ids arrive when their fixtures are fetched from API-Football.
- Tests: `tests/crests.test.mjs`, `tests/lineup-ui.test.mjs`.

## 1.7.13 — update failures now explain themselves
- Settings > App updates now shows a **Detail** line after a failed update: every field the phone's updater returned (name, code, message, status, data) plus the `downloadFailed` event if one fired.
- The connection test now also downloads the real `bundle.zip` with the phone's own HTTP and reports status, size and time. If that works but the update still fails, the updater itself is the problem; if it fails, the phone's network is.
- Server side was checked on 2026-11-10: the release has `bundle.zip` (valid zip, `index.html` at the top) and `version.json`; the download works.
- To see the new lines: install the APK of this version once, then press the update button and open Settings > App updates.

## Test: upcoming Champions League matches from StrikerAPI

`striker-test.html` has a new button "Test: does it give upcoming matches? (2 credits)" (admin action `striker-bulk`, step `upcoming`, `lib/striker.js`). It asks StrikerAPI's list for status `scheduled`, shows how many matches come back, the dates and a sample, and saves nothing (so it cannot replace the saved season list). If matches come back, a later step can put them into the app as upcoming fixtures. Test: `tests/striker-upcoming.test.mjs`.

## 1.7.26 — Trophies tab (European club trophies)

New table `bank_club_trophies` (competition, season, club, runner-up, source) with every final of: European Cup / Champions League (1955-56 to 2025-26, 71), UEFA Cup / Europa League (1971-72 to 2025-26, 55), Conference League (2021-22 to 2025-26, 5) and the UEFA Super Cup (1972 to 2026, 52; not held 1974, 1981, 1985). Friendlies are not stored; the Inter-Cities Fairs Cup and the Cup Winners' Cup are not included.
Sources: Wikipedia lists (UEFA Cup/Europa League), a Champions League winners list up to 2022-23, RSSSF (Conference League, Super Cup), and news reports for the 2023-24 to 2025-26 Champions League finals (Real Madrid, PSG, PSG). Totals were checked against the known all-time counts (for example Real Madrid 15 Champions League titles, Sevilla 7 Europa League titles).
Team screen > Trophies: for each competition the number of wins and the seasons, newest first. A club name is matched through a small alias list (AC Milan/Milan, Inter Milan/Internazionale Milano, Olympiacos/Olympiakos, and so on). Domestic leagues and cups, and the player trophies, are the next step.

## 1.7.25 — coach history (nobody is erased when a coach leaves)

Before: `bank_coaches` kept one row per club and season, so a new coach overwrote the old name and nothing said when or why he left.
Now: a new table `bank_coach_spells` (club, coach, role, started_on, ended_on, end_reason, source). It is filled by:
- the sync: when the source shows a different coach for a club, the old coach's spell is closed (date = the day we noticed, reason says "exact date and reason not recorded yet") and the new coach's spell opens;
- the admin action `coach-spell` (club, name, league, started_on, ended_on, end_reason) which sets the real dates and reason and wins over the automatic note.
Already recorded by hand from news reports: Rúben Amorim (Manchester United, left 5 Jan 2026) and Michael Carrick (left 12 Nov 2026, the club cited a disappointing start to the season).
Team screen > Overview > Coach: shows the coach in charge, "Left <date> · <reason>" when the stored coach has left and no successor is listed yet, and a "Previous coaches" list.

## 1.7.24 — team screen: dates, last starting XI, boot icon

- Team > Matches: every row now shows the date (for example "Sat 21 Nov") with the competition, not only the time.
- Team > Overview: "Best XI by rating" became "Last starting XI". It uses the line-up and formation of the club's last match whose line-up we hold (formation worked out from the pitch grid when the source gives none). Each player shows the SEASON average rating, goals and assists, not that match's rating. If no line-up is stored yet it falls back to the best-rated players in a 4-3-3.
- Assists are now shown with a boot icon (like FotMob) instead of the letter A, on the pitch and in the legend.

## 1.7.23 — upcoming Champions League matches from StrikerAPI

On the StrikerAPI test page there is a new button "Save the upcoming matches (2 credits)". It asks StrikerAPI for the scheduled 2026 Champions League matches and adds the ones we do not hold as `scheduled` matches. Rules: only club names we already know (by name or alias) are used, an unknown name is listed and skipped, a match we already hold (same two clubs within 3 days) is left alone, and finished matches are never changed. Safe to press again.

## 1.7.22 — transfer sync paused

The transfer sync (the part of the 5-minute cron that asks API-Football for player transfers) is now OFF by default. Each run logs "transfers paused". To turn it back on, set the Vercel env var SYNC_TRANSFERS to `on` (you set the value yourself) and redeploy. Squads, coach photos and match syncs are not affected.

## 1.7.21 — stop the squad refresh, coach photos in two days

- **Squad refresh stopped:** the 5-minute scheduler made the old weekly squad refresh run all day (3 clubs per run, 39 requests in one morning), and it only compared the answer with the stored squad and kept the old one. `REFRESH_DAYS` is now 60. Clubs that were never fetched are still done; the saved squads (with player photo ids) stay.
- **Coach photos, split over two days (`lib/sync-coaches.js`):** 1 `coachs?team=` request per club that has no coach id yet (about 144 clubs). At most 72 requests a day (`COACH_DAILY_CAP`, half the clubs), 3 per run, never below 15 requests left, and nothing on match days (15 or more matches today and tomorrow). The result is stored in `bank_coaches.api_id` (0 means the API has no coach, so it is not asked again). Logged as `sync-coaches` in the Log tab; the due-check answer has a `coaches` line.
- Test: `tests/sync-coaches.test.mjs`.

## 1.7.20 — team screen polish

- **Squad photos for the whole squad:** the squad list now takes each player's photo id from the API-Football squad we already saved for the club (id + shirt + name), so no new API requests. Players it cannot match show initials.
- **No more duplicate players:** a player stored twice (abbreviated API name without a birth date, plus the full Transfermarkt name) is shown once, the complete one.
- **Coach photo:** the coach row and the Overview coach card show a photo when `bank_coaches.api_id` is known (new column). `compactCoach` now keeps the coach id, so each club's next squad refresh (1 coach request) stores it. Clubs without it show initials.
- **Initials circles** in the squad list were drawn too large when a photo failed to load; fixed.
- **Matches tab order:** results first (oldest to newest), upcoming below, and the tab opens at the next match; scroll up for results.
- **Champions League upcoming:** we hold no scheduled UCL fixtures (only the 73 finished ones; Europa and Conference League have theirs). API-Football's free plan refuses UCL 2026. A football-data.org fixture import for UCL is the proposed next step.

## 1.7.19 — team screen fix

The team screen failed with "Cannot read properties of undefined (reading 'toUpperCase')": a player known only from goal events (no line-up position) broke the position check in `lib/team-view.js`. Every stored squad player (4,497) has a position. A missing line-up position is now handled and filled from the stored squad list. Test added to `tests/team-view.test.mjs`. Server-only fix: it works without a new APK (version number bumped for the record).

## 1.7.18 — team screen

Tap a club (the crest or name at the top of a match, a row in any table, or a club in a competition) to open its team screen. Back returns to where you were.
- **Overview:** form, next match, last 5 results (oldest to newest), best XI by Creator Booth rating (4-3-3, players with 2 or more rated matches, photos from API-Sports), coach.
- **Matches:** upcoming and results across every competition we store, with a filter per competition.
- **Table:** a dropdown of the competitions the club is in, with the Short / Full / Form views; the club's row is highlighted; tapping another club opens its team.
- **Stats:** record per competition (P, W, D, L, goals, clean sheets) and player leaders (rating, goals, assists, yellow cards); tapping a player opens the player card.
- **Squad:** coach and players grouped by position with shirt, nationality and age (age worked out for today).
- No trophies tab (we hold no trophy data). Ratings and player stats come only from matches whose details we hold; each screen says how many.
- Server: `GET /api/competition?team=<club>` (no new function file, so the 12-function limit is unchanged), built by `lib/team-view.js`; `lib/player-card.js` now also exposes the season's matches. Test: `tests/team-view.test.mjs`.

## 1.7.17 — league table: Short, Full and Form views, crests on every row

- The table now has a **Short / Full / Form** switch (your choice is remembered). Short: P, GD, Pts. Full: P, W, D, L, goals for-against, GD, Pts. Form: each club's last five results as W/D/L badges, oldest first, newest underlined. Form comes from `formByTeam` in `lib/match-view.js` (finished matches only, sorted by date). Test: `tests/table-form.test.mjs`.
- The match screen's table now shows a crest for every club, not just the two playing (the server sends crest ids for all clubs of the competition).
- Next up: a full team tab (overview, matches, table, stats, squad) and the player card in the chat. No trophies tab: we hold no trophy data.

## 1.7.16 — the backup AI now reads our data bank about players

- **Player facts (lib/player-facts.js):** when a question names a player, the chat adds a `PLAYER (data bank)` line: club, position, shirt, nationality, birth date, age worked out for today, loan, and this season's appearances, goals, assists and average rating from the stored matches. A name counts only when it matches exactly one stored player (a surname shared by two players adds nothing). It goes to every answering AI, so Groq (the backup) no longer invents age or club. Test: `tests/player-facts.test.mjs`.
- **Honest backup note:** without live search the AI is told not to give exact ages, heights, stats, fees or a current club unless they are in the data bank block.
- **More Gemini rotation:** when every listed model is over its quota (429), gone (404) or busy, the server now tries other stable Flash models the key can use (each has its own free quota), not only after 404.

## Backup / Gemini model retirement (api/gemini.js)

The chat showed "Backup AI used (Gemini model unavailable)": every model in `GEMINI_MODEL` answered 404 ("no longer available"), so the weaker backup (Groq, from memory) answered and made mistakes (e.g. Raphinha's foot). Google has been retiring Gemini 2.5 models early (reported from 9 July 2026). Now, when every listed model answers 404, the server asks Google for the Flash models the key can use, tries the newest stable ones, remembers the one that works for an hour and skips 404 models for an hour. `GEMINI_MODEL` still wins when its models work. Test: `tests/gemini-discover.test.mjs`.

## 1.7.15 — why the app update failed, and the fix

**Cause:** the update plugin (Capgo 7.51.23) refuses any bundle download that has no SHA-256 checksum. It throws "Checksum required" before touching the network, and the app only showed the generic "Failed to download from…". That is why the connection test showed bundle.zip reachable (200, 287 KB) while the update still failed.

**Fix:** the build workflow now computes the SHA-256 of `bundle.zip` and writes it into the published `version.json` (`checksum`, on both Supabase and the GitHub release). The app passes it to the download. Install this APK once; updates after it can download.

## 1.7.14 — fixture cards stay current, crests on the cards, 18-yard boxes on the pitch
- Fixture cards under a chat answer were snapshots: a card made before a match stayed "Upcoming" after it was played. They now refresh themselves from our data bank (`GET /api/match?cards=...`, no new function file, still 12 in `api/`): score and "Full time", "Postponed", or "Result pending" when the date has passed but no result is saved yet. A card checks when it appears, when the app comes back to the front, and every 3 minutes while open; finished cards are checked once.
- The same call returns the clubs' API-Football ids, so the cards show club crests (kept in the phone for next time); the letter badge stays where no id is known yet.
- Line-up pitch: 18-yard and 6-yard boxes at both ends, and the centre circle now scales with the pitch.
- `lib/match-view.js` `cardStates()`; test `tests/cardstate.test.mjs`.
