# Teniszruha - iOS Native Workspace (Xcode)

Ez az archívum a **Teniszruha.hu** hivatalos iOS natív projektjét tartalmazza (Capacitor 6 + React + Tailwind CSS).

## 🚀 Megnyitás és futtatás Mac gépen / Xcode-ban

### 1. Opció: Közvetlen megnyitás Xcode-ban
Kattints duplán vagy nyisd meg terminálból a `.xcworkspace` fájlt:
```bash
open ios/App/App.xcworkspace
```
> **Fontos:** Mindig az `App.xcworkspace` fájlt nyisd meg, NE az `App.xcodeproj`-ot, hogy a CocoaPods függőségek és a Capacitor modulok megfelelően betöltődjenek!

### 2. Opció: Capacitor CLI használatával
Amennyiben a teljes Node.js projekt könyvtárban vagy:
```bash
npx cap open ios
```

### 3. Függőségek frissítése (CocoaPods)
Ha új plugint vagy modult adsz hozzá:
```bash
cd ios/App
pod install
```

## 📱 Alkalmazás adatai
- **App Neve:** Teniszruha
- **Bundle Identifier:** `hu.teniszruha.app`
- **Fő cél (Deployment Target):** iOS 13.0+
- **Támogatott eszközök:** iPhone & iPad (Universal)
- **Kijelző mód:** Automatikus Világos / Sötét mód (Light / Dark)
- **Ikonok & Splash:** Nagyfelbontású 1024x1024 App Store ikon, Retina skálák, 2732x2732 Launch Storyboard splash screen.
