# Creator Booth — Android app (v1.3.3)

A native shell around the same web app as creator-boot.vercel.app. The web files are bundled
inside the app, so it opens instantly and starts offline. Chats, AI and sign-in still go to the
live backend (Supabase + the Vercel API), exactly like the website.

**Updates:** after the first install, ordinary changes (features, UI, prompts, fixes) reach
installed apps automatically: the app finds the newer web build on GitHub, downloads it quietly
and shows "A new version is ready — Restart". Only native changes (a new plugin, permission or
icon) need people to install a new APK.

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
