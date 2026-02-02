# Android build (Capacitor)

This folder is a minimal Capacitor wrapper.

GitHub Actions will:
1) Fetch the upstream DM's Toolbox site into `../app/web`
2) Copy it into `www/`
3) Generate the Android project (`npx cap add android`)
4) Build:
   - Debug APK (sideload friendly)
   - Release AAB (unsigned)

To sign for Play Store later, you'll add a keystore + secrets and enable Gradle signing.
