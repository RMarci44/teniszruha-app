# Teniszruha.hu - Cross-Platform iOS & Android Mobilalkalmazás

Hivatalos mobil webalkalmazás és natív iOS / Android alkalmazás a [teniszruha.hu](https://www.teniszruha.hu) tenisz szakáruházhoz.

---

## 📱 iOS Alkalmazás Megoldások

A Windows környezet nem futtat Xcode-ot helyben, ezért a projekt **3 különböző módon** biztosítja az iOS használatot és terjesztést:

### 1. 🍏 Azonnali Telepítés iPhone-ra (Safari WebClip / PWA)
- **Hogyan működik:** Nyisd meg a webalkalmazást iPhone Safariban.
- Koppints alul a **Megosztás (Share)** gombra, majd válaszd a **„Hozzáadás a főképernyőhöz” (Add to Home Screen)** lehetőséget.
- **Eredmény:** Az app azonnal megjelenik az iPhone főképernyőjén egyedi, nagyfelbontású teniszlabdás ikonnal (`apple-touch-icon.png`), és böngészősávok nélkül, teljes képernyős natív hatással indul (`standalone`, `black-translucent` státuszsáv, safe-area kivágás támogatás).

### 2. ☁️ Mac Nélküli Automatikus Felhős Építés (.IPA fájl)
- A projekt tartalmaz egy kulcsrakész GitHub Actions munkafolyamatot: [`.github/workflows/build-ios.yml`](.github/workflows/build-ios.yml)
- **Hogyan használd:**
  1. Töltsd fel a projektet egy GitHub repository-ba (akár privátba).
  2. A repository **Actions** fülén kattints a **"Build iOS Application (IPA)"** munkafolyamatra és indítsd el a **"Run workflow"** gombbal.
  3. A GitHub ingyenes `macos-latest` virtuális gépén lefut az `xcodebuild`, és kész **`Teniszruha.ipa`** csomagot készít, amit közvetlenül letölthetsz az Artifacts menüből.
  4. Az elkészült `.ipa` fájl Mac nélkül telepíthető bármely iPhone-ra (AltStore, Sideloadly, TrollStore vagy TestFlight segítségével).

### 3. 📦 Teljes Natív Xcode Csomag Mac-re (`teniszruha-ios.zip`)
- A projekt gyökerében megtalálható a komplett előkészített és szinkronizált iOS projekt: **`teniszruha-ios.zip`**.
- **Használat Mac gépen:**
  1. Csomagold ki a projekt mappájában (vagy másold át a gépedre).
  2. Nyisd meg Xcode-ban:
     ```bash
     npx cap open ios
     # vagy nyisd meg közvetlenül: ios/App/App.xcworkspace
     ```
  3. Xcode-ban válaszd ki a célkészüléket vagy szimulátort, és kattints a **Run (▶)** gombra.

---

## ⚙️ iOS Natív Konfiguráció Részletei

- **Alkalmazás neve:** `Teniszruha`
- **Bundle Identifier:** `hu.teniszruha.app`
- **Info.plist beállítások:**
  - `UIRequiredDeviceCapabilities`: `arm64` (Modern 64-bit iOS architektúra)
  - `UIViewControllerBasedStatusBarAppearance`: `true`
  - `UIUserInterfaceStyle`: `Automatic` (Dinamikus iOS Light / Dark téma támogatás)
  - `UIStatusBarStyle`: `UIStatusBarStyleLightContent`
  - `ITSAppUsesNonExemptEncryption`: `false` (Nincs titkosítási figyelmeztetés App Store / TestFlight feltöltéskor)
  - `NSAppTransportSecurity`: Külső képek és API kapcsolat engedélyezve
- **Ikonok & Splash Képernyő:**
  - `Assets.xcassets/AppIcon.appiconset`: Teljes iPhone, iPad és App Store ikoncsalád (1024x1024 master, 20pt–83.5pt @1x, @2x, @3x skálák, `Contents.json` lefedettség).
  - `Assets.xcassets/Splash.imageset`: 2732x2732 prémium nyitóképernyő (`TENISZRUHA.HU` felirattal és logóval).
  - PWA / WebClip: Apple Touch Icon méretek iPhone-ra (180x180) és iPadre (167x167, 152x152).
- **Hordozhatóság:**
  - A `teniszruha-ios.zip` tartalmazza az önálló `capacitor-pods` könyvtárat is, így Mac gépen külső npm telepítés nélkül is feloldhatók a CocoaPods podspec-ek.

---

## 🤖 Android Alkalmazás

A projekt tartalmazza a készre fordított Android APK csomagot is a gyökérkönyvtárban:
- **`teniszruha.apk`** (közvetlenül telepíthető Android telefonra vagy emulátorra).
- Natív forráskód: `/android` mappában (Android Studio kompatibilis).

---

## 🛠 Fejlesztői Parancsok

```bash
# Függőségek telepítése
npm install

# Fejlesztői szerver indítása (böngészőben)
npm run dev

# Webes alkalmazás lefordítása
npm run build

# iOS projekt szinkronizálása
npx cap sync ios

# iOS zip újra-csomagolása
python scripts/package_ios_zip.py

# Android szinkronizálás és futtatás
npm run cap:sync
```

---

## 🌐 API Integráció

- **Webáruház API:** `https://www.teniszruha.hu/api-json/wc/store/v1/`
- Fejlesztés közben a Vite beépített proxyja (`vite.config.ts`) kezeli a kéréseket.
- Offline vagy kapcsolat nélküli állapotban automatikus tartalék termékkatalógus lép működésbe.
