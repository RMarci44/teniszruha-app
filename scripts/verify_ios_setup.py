import os
import sys
import json
import zipfile
import plistlib
from PIL import Image

if sys.stdout.encoding and sys.stdout.encoding.lower() != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except:
        pass

def run_tests():
    print("=" * 60)
    print("[*] RUNNING COMPREHENSIVE iOS APP VERIFICATION SUITE")
    print("=" * 60)

    passed = 0
    failed = 0

    def assert_test(cond, name, details=""):
        nonlocal passed, failed
        if cond:
            print(f"  [PASS]: {name}")
            passed += 1
        else:
            print(f"  [FAIL]: {name} - {details}")
            failed += 1

    # 1. Project folder checks
    ios_dir = "ios"
    assert_test(os.path.isdir(ios_dir), "iOS Directory Exists")
    assert_test(os.path.isdir("ios/App/App.xcworkspace"), "App.xcworkspace Exists")
    assert_test(os.path.isfile("ios/App/App.xcodeproj/project.pbxproj"), "project.pbxproj Exists")
    assert_test(os.path.isfile("ios/App/Podfile"), "Podfile Exists")
    assert_test(os.path.isfile("ios/App/App/AppDelegate.swift"), "AppDelegate.swift Exists")
    assert_test(os.path.isfile("ios/App/App/Info.plist"), "Info.plist Exists")
    assert_test(os.path.isfile("ios/App/App/capacitor.config.json"), "iOS capacitor.config.json Exists")

    # 2. Info.plist inspection
    try:
        with open("ios/App/App/Info.plist", "rb") as f:
            plist = plistlib.load(f)
        assert_test(plist.get("CFBundleDisplayName") == "Teniszruha", "Info.plist CFBundleDisplayName is 'Teniszruha'")
        assert_test(plist.get("CFBundleIdentifier") == "$(PRODUCT_BUNDLE_IDENTIFIER)", "Info.plist CFBundleIdentifier is $(PRODUCT_BUNDLE_IDENTIFIER)")
        assert_test(plist.get("UIViewControllerBasedStatusBarAppearance") is True, "Info.plist UIViewControllerBasedStatusBarAppearance is True")
        assert_test(plist.get("UIUserInterfaceStyle") == "Automatic", "Info.plist UIUserInterfaceStyle is Automatic")
        assert_test(plist.get("ITSAppUsesNonExemptEncryption") is False, "Info.plist ITSAppUsesNonExemptEncryption is False")
        assert_test(plist.get("UIRequiredDeviceCapabilities") == ["arm64"], "Info.plist UIRequiredDeviceCapabilities is modern ['arm64']")
        assert_test("NSAppTransportSecurity" in plist, "Info.plist NSAppTransportSecurity defined")
    except Exception as e:
        assert_test(False, "Info.plist valid plist format", str(e))

    # 3. project.pbxproj inspection
    with open("ios/App/App.xcodeproj/project.pbxproj", "r", encoding="utf-8") as f:
        pbx_content = f.read()
    assert_test("hu.teniszruha.app" in pbx_content, "project.pbxproj contains Bundle ID hu.teniszruha.app")

    # 4. Capacitor config inspection
    with open("ios/App/App/capacitor.config.json", "r", encoding="utf-8") as f:
        cap_json = json.load(f)
    assert_test(cap_json.get("appId") == "hu.teniszruha.app", "Capacitor JSON appId is hu.teniszruha.app")
    assert_test(cap_json.get("appName") == "Teniszruha", "Capacitor JSON appName is Teniszruha")

    # 5. Assets inspection
    icon_path = "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png"
    assert_test(os.path.isfile(icon_path), "iOS AppIcon image exists")
    if os.path.isfile(icon_path):
        icon_img = Image.open(icon_path)
        assert_test(icon_img.size == (1024, 1024), f"iOS AppIcon size is 1024x1024 (got {icon_img.size})")
        assert_test(icon_img.mode == "RGB", f"iOS AppIcon mode is RGB without alpha (got {icon_img.mode})")

    # Check individual icon variants
    for variant, expected_size in [
        ("AppIcon-60x60@3x.png", (180, 180)),
        ("AppIcon-60x60@2x.png", (120, 120)),
        ("AppIcon-76x76@2x.png", (152, 152)),
        ("AppIcon-83.5x83.5@2x.png", (167, 167)),
        ("AppIcon-20x20@2x.png", (40, 40)),
        ("AppIcon-29x29@2x.png", (58, 58)),
    ]:
        v_path = f"ios/App/App/Assets.xcassets/AppIcon.appiconset/{variant}"
        assert_test(os.path.isfile(v_path), f"iOS icon variant {variant} exists")
        if os.path.isfile(v_path):
            img_v = Image.open(v_path)
            assert_test(img_v.size == expected_size, f"Icon {variant} size matches {expected_size}")

    with open("ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json", "r", encoding="utf-8") as f:
        appicon_contents = json.load(f)
    idioms = {img.get("idiom") for img in appicon_contents.get("images", [])}
    assert_test("iphone" in idioms and "ipad" in idioms and "ios-marketing" in idioms, "AppIcon Contents.json covers iphone, ipad, and ios-marketing idioms")

    splash_path = "ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png"
    assert_test(os.path.isfile(splash_path), "iOS Splash image exists")
    if os.path.isfile(splash_path):
        splash_img = Image.open(splash_path)
        assert_test(splash_img.size == (2732, 2732), f"iOS Splash size is 2732x2732 (got {splash_img.size})")
        assert_test(splash_img.mode == "RGB", f"iOS Splash mode is RGB (got {splash_img.mode})")

    # 6. PWA & Web Clip inspection
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()
    assert_test('name="apple-mobile-web-app-capable" content="yes"' in html, "index.html apple-mobile-web-app-capable is yes")
    assert_test('name="apple-mobile-web-app-status-bar-style" content="black-translucent"' in html, "index.html apple-mobile-web-app-status-bar-style is black-translucent")
    assert_test('name="apple-mobile-web-app-title" content="Teniszruha"' in html, "index.html apple-mobile-web-app-title is Teniszruha")
    assert_test('rel="apple-touch-icon"' in html, "index.html apple-touch-icon link is present")
    assert_test('rel="manifest"' in html, "index.html manifest link is present")

    for ati_file, expected_px in [
        ("public/apple-touch-icon.png", (180, 180)),
        ("public/apple-touch-icon-167x167.png", (167, 167)),
        ("public/apple-touch-icon-152x152.png", (152, 152)),
    ]:
        assert_test(os.path.isfile(ati_file), f"{ati_file} exists")
        if os.path.isfile(ati_file):
            ati_img = Image.open(ati_file)
            assert_test(ati_img.size == expected_px, f"{ati_file} size is {expected_px} (got {ati_img.size})")

    manifest_path = "public/manifest.webmanifest"
    assert_test(os.path.isfile(manifest_path), "manifest.webmanifest exists")
    if os.path.isfile(manifest_path):
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest_json = json.load(f)
        assert_test(manifest_json.get("display") == "standalone", "manifest display is standalone")
        assert_test(manifest_json.get("short_name") == "Teniszruha", "manifest short_name is Teniszruha")

    # IosInstallBanner inspection
    with open("src/components/IosInstallBanner.tsx", "r", encoding="utf-8") as f:
        banner_content = f.read()
    assert_test("maxTouchPoints" in banner_content, "IosInstallBanner detects iPadOS using maxTouchPoints")
    assert_test("safe-area-inset-bottom" in banner_content, "IosInstallBanner respects safe-area-inset-bottom")

    # Podfile inspection
    with open("ios/App/Podfile", "r", encoding="utf-8") as f:
        podfile_content = f.read()
    assert_test("CODE_SIGNING_ALLOWED" in podfile_content, "Podfile disables code signing on Pods for CI builds")
    assert_test("capacitor-pods" in podfile_content, "Podfile includes standalone fallback paths for capacitor pods")

    # 7. Cloud Build GitHub Actions workflow inspection
    workflow_path = ".github/workflows/build-ios.yml"
    assert_test(os.path.isfile(workflow_path), "GitHub Actions build-ios.yml exists")
    if os.path.isfile(workflow_path):
        with open(workflow_path, "r", encoding="utf-8") as f:
            wf_content = f.read()
        assert_test("macos-latest" in wf_content, "build-ios.yml uses macos-latest runner")
        assert_test("xcodebuild archive" in wf_content, "build-ios.yml executes xcodebuild archive")
        assert_test("Teniszruha.ipa" in wf_content, "build-ios.yml packages Teniszruha.ipa")
        assert_test("actions/upload-artifact" in wf_content, "build-ios.yml uploads artifact")

    # 8. Zip workspace inspection
    zip_path = "teniszruha-ios.zip"
    assert_test(os.path.isfile(zip_path), "teniszruha-ios.zip exists in project root")
    if os.path.isfile(zip_path):
        zip_size = os.path.getsize(zip_path)
        assert_test(zip_size > 1_000_000, f"teniszruha-ios.zip is > 1MB ({zip_size / (1024*1024):.2f} MB)")
        with zipfile.ZipFile(zip_path, 'r') as z:
            names = z.namelist()
            assert_test(any("App.xcworkspace" in n for n in names), "zip contains App.xcworkspace")
            assert_test(any("project.pbxproj" in n for n in names), "zip contains project.pbxproj")
            assert_test(any("Info.plist" in n for n in names), "zip contains Info.plist")
            assert_test(any("AppIcon-512@2x.png" in n for n in names), "zip contains AppIcon-512@2x.png")
            assert_test(any("capacitor-pods" in n for n in names), "zip contains standalone capacitor-pods")
            assert_test(any("README.md" in n for n in names), "zip contains README.md")

    print("=" * 60)
    print(f"RESULTS: {passed} PASSED, {failed} FAILED")
    print("=" * 60)

    if failed > 0:
        sys.exit(1)

if __name__ == "__main__":
    run_tests()
