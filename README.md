# Creator Booth — Android app (v1.2.4)

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

Only ever bump the **last** number (1.2.4 → 1.2.5), in `package.json` here and `APP_VERSION` in the website's `index.html`. The Android version name is read from `package.json`; the build number (version code) is added automatically on every build.

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
