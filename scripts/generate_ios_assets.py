import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

def draw_tennis_ball(size, bg_color=(9, 13, 22), is_splash=False):
    # Supersampling 2x for smooth antialiasing
    scale = 2
    w = size[0] * scale
    h = size[1] * scale
    
    img = Image.new('RGB', (w, h), bg_color)
    draw = ImageDraw.Draw(img)
    
    cx = w // 2
    # If splash, place ball slightly above center to leave room for text
    cy = int(h * 0.44) if is_splash else h // 2
    
    # Ball radius
    r = int(min(w, h) * (0.16 if is_splash else 0.36))
    
    # Draw soft outer glow / shadow under ball
    glow_r = int(r * 1.08)
    for i in range(glow_r, r, -1):
        alpha = int(25 * (1 - (i - r) / (glow_r - r)))
        draw.ellipse([cx - i, cy - i + int(r * 0.05), cx + i, cy + i + int(r * 0.05)],
                     outline=(30, 45, 60))
    
    # Draw 3D-shaded ball using concentric circles or radial gradient
    # Light source from top-left (cx - r*0.35, cy - r*0.35)
    lx = cx - int(r * 0.3)
    ly = cy - int(r * 0.3)
    
    # Base ball fill with 3D gradient
    # We step pixel by pixel or in concentric rings on a separate high-res canvas
    ball_canvas = Image.new('RGBA', (r * 2 + 4, r * 2 + 4), (0, 0, 0, 0))
    bc_draw = ImageDraw.Draw(ball_canvas)
    bc_cx = r + 2
    bc_cy = r + 2
    
    # Create radial gradient on the ball
    for y in range(r * 2 + 4):
        for x in range(r * 2 + 4):
            dx = x - bc_cx
            dy = y - bc_cy
            dist = math.sqrt(dx * dx + dy * dy)
            if dist <= r:
                # Distance from light source
                dlx = x - (bc_cx - int(r * 0.28))
                dly = y - (bc_cy - int(r * 0.28))
                light_dist = math.sqrt(dlx * dlx + dly * dly) / (r * 1.5)
                light_dist = min(1.0, max(0.0, light_dist))
                
                # Tennis amber colors:
                # Highlight: (254, 240, 138)  # yellow-200
                # Midtone:   (251, 191, 36)   # amber-400
                # Shadow:    (217, 119, 6)    # amber-600
                # Rim shadow:(180, 83, 9)     # amber-700
                if light_dist < 0.4:
                    t = light_dist / 0.4
                    red = int(254 * (1 - t) + 251 * t)
                    green = int(240 * (1 - t) + 191 * t)
                    blue = int(138 * (1 - t) + 36 * t)
                elif light_dist < 0.85:
                    t = (light_dist - 0.4) / 0.45
                    red = int(251 * (1 - t) + 217 * t)
                    green = int(191 * (1 - t) + 119 * t)
                    blue = int(36 * (1 - t) + 6 * t)
                else:
                    t = (light_dist - 0.85) / 0.15
                    red = int(217 * (1 - t) + 180 * t)
                    green = int(119 * (1 - t) + 83 * t)
                    blue = int(6 * (1 - t) + 9 * t)
                
                # Edge antialiasing
                alpha = 255
                if dist > r - 1.5:
                    alpha = int(255 * (r - dist) / 1.5)
                    alpha = max(0, min(255, alpha))
                ball_canvas.putpixel((x, y), (red, green, blue, alpha))
    
    # Paste ball canvas onto main image
    ball_rgb = ball_canvas.convert('RGB')
    mask = ball_canvas.split()[3]
    img.paste(ball_rgb, (cx - bc_cx, cy - bc_cy), mask)
    
    # Draw the characteristic curved white seams of the tennis ball
    # Bezier curve approximation or arc sampling
    seam_draw = ImageDraw.Draw(img)
    seam_width = max(3, int(r * 0.08))
    
    # Left seam: starts near top-left of circle, curves inward, ends near bottom-left
    # Parametric curve:
    def draw_curved_seam(is_left=True):
        points = []
        steps = 60
        direction = -1 if is_left else 1
        for s in range(steps + 1):
            t = s / steps
            # Angle roughly from -70 deg to +70 deg
            ang = -1.1 + t * 2.2
            # Base position on sphere edge
            base_x = cx + direction * r * 0.72 * math.cos(ang * 0.6)
            # Inward bend at t ~ 0.5
            bend = (1.0 - 4.0 * (t - 0.5) ** 2) * (r * 0.32)
            cur_x = base_x - direction * bend
            cur_y = cy + r * 0.82 * math.sin(ang)
            points.append((cur_x, cur_y))
        
        # Draw seam shadow first
        shadow_pts = [(p[0] + scale, p[1] + scale) for p in points]
        for idx in range(len(shadow_pts) - 1):
            seam_draw.line([shadow_pts[idx], shadow_pts[idx+1]], fill=(160, 70, 5), width=seam_width + 2)
            
        # Draw white seam
        for idx in range(len(points) - 1):
            seam_draw.line([points[idx], points[idx+1]], fill=(255, 255, 255), width=seam_width)
            
    draw_curved_seam(is_left=True)
    draw_curved_seam(is_left=False)
    
    # Draw tennis racket / monogram or subtle accents if needed
    if is_splash:
        # Draw "TENISZRUHA" text and subtitle
        text_y = cy + r + int(min(w, h) * 0.08)
        
        # Let's check available fonts or use default
        try:
            # Try Windows system fonts
            font_title = ImageFont.truetype("C:\\Windows\\Fonts\\segoeuib.ttf", int(min(w, h) * 0.048))
            font_sub = ImageFont.truetype("C:\\Windows\\Fonts\\segoeui.ttf", int(min(w, h) * 0.022))
        except:
            font_title = ImageFont.load_default()
            font_sub = ImageFont.load_default()
            
        title_text = "TENISZRUHA.HU"
        sub_text = "PREMIUM TENISZ RUHÁZAT & ÜTŐK"
        
        # Draw title text centered
        bbox = draw.textbbox((0, 0), title_text, font=font_title)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        draw.text((cx - tw // 2, text_y), title_text, fill=(255, 255, 255), font=font_title)
        
        # Draw subtitle text centered
        bbox_sub = draw.textbbox((0, 0), sub_text, font=font_sub)
        sw = bbox_sub[2] - bbox_sub[0]
        draw.text((cx - sw // 2, text_y + th + int(min(w, h) * 0.025)), sub_text, fill=(148, 163, 184), font=font_sub)
    
    # Resample down to requested size with Lanczos filter for maximum sharpness
    final_img = img.resize(size, Image.Resampling.LANCZOS)
    return final_img

def main():
    print("Generating iOS & PWA icons and splash assets...")
    os.makedirs("ios/App/App/Assets.xcassets/AppIcon.appiconset", exist_ok=True)
    os.makedirs("ios/App/App/Assets.xcassets/Splash.imageset", exist_ok=True)
    os.makedirs("public", exist_ok=True)
    
    # 1. iOS AppIcon set (Apple App Store + iPhone + iPad)
    master_icon = draw_tennis_ball((1024, 1024), is_splash=False)
    
    # Save 1024x1024 App Store / Marketing icon
    master_icon.save("ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png", "PNG")
    print("Saved iOS AppIcon (1024x1024)")
    
    # Standard iOS icon sizes: (filename, px_size, idiom, size_pt, scale)
    ios_icons = [
        ("AppIcon-20x20@2x.png", 40, "iphone", "20x20", "2x"),
        ("AppIcon-20x20@3x.png", 60, "iphone", "20x20", "3x"),
        ("AppIcon-29x29@2x.png", 58, "iphone", "29x29", "2x"),
        ("AppIcon-29x29@3x.png", 87, "iphone", "29x29", "3x"),
        ("AppIcon-40x40@2x.png", 80, "iphone", "40x40", "2x"),
        ("AppIcon-40x40@3x.png", 120, "iphone", "40x40", "3x"),
        ("AppIcon-60x60@2x.png", 120, "iphone", "60x60", "2x"),
        ("AppIcon-60x60@3x.png", 180, "iphone", "60x60", "3x"),
        ("AppIcon-20x20@1x.png", 20, "ipad", "20x20", "1x"),
        ("AppIcon-29x29@1x.png", 29, "ipad", "29x29", "1x"),
        ("AppIcon-40x40@1x.png", 40, "ipad", "40x40", "1x"),
        ("AppIcon-76x76@1x.png", 76, "ipad", "76x76", "1x"),
        ("AppIcon-76x76@2x.png", 152, "ipad", "76x76", "2x"),
        ("AppIcon-83.5x83.5@2x.png", 167, "ipad", "83.5x83.5", "2x"),
    ]
    
    for fname, px, _, _, _ in ios_icons:
        resized = master_icon.resize((px, px), Image.Resampling.LANCZOS)
        resized.save(f"ios/App/App/Assets.xcassets/AppIcon.appiconset/{fname}", "PNG")
    print(f"Saved {len(ios_icons)} individual iOS icon scale variants")
    
    # Write complete Contents.json for AppIcon.appiconset
    contents_images = [
        {"idiom": "iphone", "size": "20x20", "scale": "2x", "filename": "AppIcon-20x20@2x.png"},
        {"idiom": "iphone", "size": "20x20", "scale": "3x", "filename": "AppIcon-20x20@3x.png"},
        {"idiom": "iphone", "size": "29x29", "scale": "2x", "filename": "AppIcon-29x29@2x.png"},
        {"idiom": "iphone", "size": "29x29", "scale": "3x", "filename": "AppIcon-29x29@3x.png"},
        {"idiom": "iphone", "size": "40x40", "scale": "2x", "filename": "AppIcon-40x40@2x.png"},
        {"idiom": "iphone", "size": "40x40", "scale": "3x", "filename": "AppIcon-40x40@3x.png"},
        {"idiom": "iphone", "size": "60x60", "scale": "2x", "filename": "AppIcon-60x60@2x.png"},
        {"idiom": "iphone", "size": "60x60", "scale": "3x", "filename": "AppIcon-60x60@3x.png"},
        {"idiom": "ipad", "size": "20x20", "scale": "1x", "filename": "AppIcon-20x20@1x.png"},
        {"idiom": "ipad", "size": "20x20", "scale": "2x", "filename": "AppIcon-20x20@2x.png"},
        {"idiom": "ipad", "size": "29x29", "scale": "1x", "filename": "AppIcon-29x29@1x.png"},
        {"idiom": "ipad", "size": "29x29", "scale": "2x", "filename": "AppIcon-29x29@2x.png"},
        {"idiom": "ipad", "size": "40x40", "scale": "1x", "filename": "AppIcon-40x40@1x.png"},
        {"idiom": "ipad", "size": "40x40", "scale": "2x", "filename": "AppIcon-40x40@2x.png"},
        {"idiom": "ipad", "size": "76x76", "scale": "1x", "filename": "AppIcon-76x76@1x.png"},
        {"idiom": "ipad", "size": "76x76", "scale": "2x", "filename": "AppIcon-76x76@2x.png"},
        {"idiom": "ipad", "size": "83.5x83.5", "scale": "2x", "filename": "AppIcon-83.5x83.5@2x.png"},
        {"idiom": "ios-marketing", "size": "1024x1024", "scale": "1x", "filename": "AppIcon-512@2x.png"}
    ]
    import json
    with open("ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json", "w", encoding="utf-8") as f:
        json.dump({"images": contents_images, "info": {"author": "xcode", "version": 1}}, f, indent=2)
    print("Updated AppIcon.appiconset/Contents.json")
    
    # 2. Splash Screens (2732x2732)
    splash = draw_tennis_ball((2732, 2732), is_splash=True)
    splash.save("ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732.png", "PNG")
    splash.save("ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-1.png", "PNG")
    splash.save("ios/App/App/Assets.xcassets/Splash.imageset/splash-2732x2732-2.png", "PNG")
    print("Saved iOS Splash screens (2732x2732)")
    
    # 3. PWA / Apple Touch Icon for Home Screen
    pwa_apple_icon = draw_tennis_ball((180, 180), is_splash=False)
    pwa_apple_icon.save("public/apple-touch-icon.png", "PNG")
    pwa_apple_icon.save("public/apple-touch-icon-precomposed.png", "PNG")
    
    # Also save iPad specific Apple touch icons
    apple_152 = master_icon.resize((152, 152), Image.Resampling.LANCZOS)
    apple_152.save("public/apple-touch-icon-152x152.png", "PNG")
    apple_167 = master_icon.resize((167, 167), Image.Resampling.LANCZOS)
    apple_167.save("public/apple-touch-icon-167x167.png", "PNG")
    print("Saved public/apple-touch-icon.png (180x180, 167x167, 152x152)")
    
    # 4. PWA standard icons
    icon_192 = draw_tennis_ball((192, 192), is_splash=False)
    icon_192.save("public/icon-192.png", "PNG")
    
    icon_512 = draw_tennis_ball((512, 512), is_splash=False)
    icon_512.save("public/icon-512.png", "PNG")
    print("Saved public/icon-192.png and public/icon-512.png")

if __name__ == "__main__":
    main()
