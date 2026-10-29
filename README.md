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
