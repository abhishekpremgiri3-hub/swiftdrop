# SwiftDrop V10

SwiftDrop V10 is a clean Capacitor Android starter with a mobile-first delivery order flow.

## Current V10 foundation

- Customer delivery form
- Indian mobile validation
- Pickup/drop validation
- Distance validation
- Deterministic distance pricing
- Unique order IDs
- Local order storage
- Order status foundation
- Capacitor Android configuration
- GitHub Actions APK workflow

## Build

Requirements: Node 20+, Java 17.

```bash
npm install
npm run build
npx cap add android
npx cap sync android
cd android
./gradlew assembleDebug
```

APK:
`android/app/build/outputs/apk/debug/app-debug.apk`

## Important

This V10 foundation is designed to build cleanly. Real multi-user backend, authentication, live GPS, maps, payments, and rider dispatch should be connected before a production Play Store launch.
